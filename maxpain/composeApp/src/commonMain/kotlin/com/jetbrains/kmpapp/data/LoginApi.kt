package com.jetbrains.kmpapp.data

import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.http.ContentType
import io.ktor.http.contentType
import io.ktor.serialization.kotlinx.json.json
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

interface LoginApi {
    suspend fun login(email: String, password: String): LoginResponse
}

class KtorLoginApi(private val client: HttpClient) : LoginApi {
    companion object {
        private const val API_URL = "http://10.0.2.2:8001/login"
    }

    override suspend fun login(email: String, password: String): LoginResponse {
        return try {
            val response = client.post(API_URL) {
                contentType(ContentType.Application.Json)
                setBody(Json.encodeToString(mapOf("email" to email, "password" to password)))
            }

            val responseBody = response.body<String>()
            println("Response: $responseBody") // Log the raw response body

            // Deserialize the response body to LoginResponse
            Json {
                ignoreUnknownKeys = true
                isLenient = true
            }.decodeFromString(LoginResponse.serializer(), responseBody)
        } catch (e: Exception) {
            e.printStackTrace()
            throw e
        }
    }
}

// Initialize HttpClient with logging and JSON configuration
val client = HttpClient {
    install(ContentNegotiation) {
        json(Json {
            ignoreUnknownKeys = true
            isLenient = true
        })
    }
}
