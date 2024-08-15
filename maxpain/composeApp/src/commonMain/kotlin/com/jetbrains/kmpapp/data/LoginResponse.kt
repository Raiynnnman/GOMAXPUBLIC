package com.jetbrains.kmpapp.data

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class LoginResponse(
    @SerialName("success") val success: Boolean,
    @SerialName("message") val message: String? = null,
    @SerialName("data") val data: Data? = null
) {
    @Serializable
    data class Data(
        @SerialName("token") val token: String
    )
}
