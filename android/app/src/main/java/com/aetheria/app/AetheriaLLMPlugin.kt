package com.aetheria.app

import android.util.Log
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.google.ai.edge.litertlm.Engine
import com.google.ai.edge.litertlm.EngineConfig
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileOutputStream
import java.net.HttpURLConnection
import java.net.URL

/**
 * Bridges the web layer to an on-device Gemma 4 E4B model via LiteRT-LM, so sensitive
 * consultation prompts (birth data, dream journal content) can be answered without leaving
 * the device. Mirrors server.ts's cloud endpoints in shape (stateless per-call, prompt +
 * optional system instruction in, generated text out) so api_service.js can route between
 * this and the cloud fallback with the same request/response contract.
 */
@CapacitorPlugin(name = "AetheriaLLM")
class AetheriaLLMPlugin : Plugin() {

    companion object {
        private const val TAG = "AetheriaLLM"
        private const val MODEL_URL =
            "https://huggingface.co/litert-community/gemma-4-E4B-it-litert-lm/resolve/main/gemma-4-E4B-it.litertlm"
        private const val MODEL_FILENAME = "gemma-4-E4B-it.litertlm"
    }

    private val scope = CoroutineScope(Dispatchers.IO)
    private val engineMutex = Mutex()
    private var engine: Engine? = null
    private var isDownloading = false

    private fun modelFile(): File {
        val dir = File(context.filesDir, "models")
        if (!dir.exists()) dir.mkdirs()
        return File(dir, MODEL_FILENAME)
    }

    private fun tempModelFile(): File = File(modelFile().parentFile, "$MODEL_FILENAME.part")

    @PluginMethod
    fun isModelReady(call: PluginCall) {
        val result = JSObject()
        result.put("ready", modelFile().exists())
        call.resolve(result)
    }

    @PluginMethod
    fun downloadModel(call: PluginCall) {
        val file = modelFile()
        if (file.exists()) {
            val result = JSObject()
            result.put("alreadyDownloaded", true)
            call.resolve(result)
            return
        }
        if (isDownloading) {
            call.reject("Download already in progress")
            return
        }

        isDownloading = true
        val temp = tempModelFile()

        scope.launch {
            try {
                val connection = URL(MODEL_URL).openConnection() as HttpURLConnection
                connection.connectTimeout = 30000
                connection.readTimeout = 30000
                connection.instanceFollowRedirects = true
                connection.connect()

                if (connection.responseCode !in 200..299) {
                    throw Exception("HTTP ${connection.responseCode}: ${connection.responseMessage}")
                }

                val totalBytes = connection.contentLengthLong
                var downloadedBytes = 0L
                var lastReportedPercent = -1

                connection.inputStream.use { input ->
                    FileOutputStream(temp).use { output ->
                        val buffer = ByteArray(256 * 1024)
                        var bytesRead: Int
                        while (input.read(buffer).also { bytesRead = it } != -1) {
                            output.write(buffer, 0, bytesRead)
                            downloadedBytes += bytesRead

                            if (totalBytes > 0) {
                                val percent = ((downloadedBytes * 100) / totalBytes).toInt()
                                if (percent != lastReportedPercent) {
                                    lastReportedPercent = percent
                                    val progress = JSObject()
                                    progress.put("downloadedBytes", downloadedBytes)
                                    progress.put("totalBytes", totalBytes)
                                    progress.put("percent", percent)
                                    notifyListeners("downloadProgress", progress)
                                }
                            }
                        }
                    }
                }

                if (!temp.renameTo(file)) {
                    throw Exception("Failed to finalize downloaded model file")
                }

                isDownloading = false
                val result = JSObject()
                result.put("alreadyDownloaded", false)
                call.resolve(result)
            } catch (e: Exception) {
                isDownloading = false
                temp.delete()
                Log.e(TAG, "Model download failed", e)
                call.reject("Model download failed: ${e.message}", e)
            }
        }
    }

    @PluginMethod
    fun generate(call: PluginCall) {
        val prompt = call.getString("prompt")
        val systemInstruction = call.getString("systemInstruction")

        if (prompt.isNullOrBlank()) {
            call.reject("Missing required 'prompt' parameter")
            return
        }
        if (!modelFile().exists()) {
            call.reject("Model not downloaded yet — call downloadModel() first")
            return
        }

        scope.launch {
            try {
                val activeEngine = getOrInitEngine()
                val fullPrompt = if (!systemInstruction.isNullOrBlank()) {
                    "$systemInstruction\n\n$prompt"
                } else {
                    prompt
                }

                activeEngine.createConversation().use { conversation ->
                    val response = conversation.sendMessage(fullPrompt)
                    val result = JSObject()
                    result.put("text", response.toString())
                    call.resolve(result)
                }
            } catch (e: Exception) {
                Log.e(TAG, "On-device generation failed", e)
                call.reject("On-device generation failed: ${e.message}", e)
            }
        }
    }

    // Lazily initializes the Engine once, on a background thread (init can take up to ~10s
    // per LiteRT-LM's own docs) — guarded by a mutex so two concurrent generate() calls don't
    // race to create two Engines against the same model file.
    private suspend fun getOrInitEngine(): Engine {
        engine?.let { return it }
        return engineMutex.withLock {
            engine?.let { return it }
            withContext(Dispatchers.IO) {
                val config = EngineConfig(modelPath = modelFile().absolutePath)
                val newEngine = Engine(config)
                newEngine.initialize()
                engine = newEngine
                newEngine
            }
        }
    }
}
