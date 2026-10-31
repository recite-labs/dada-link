package org.recitelabs.dadalink.core.network

/** Base URL of the DadaLink API. (A plain class: Dagger cannot inject inline value classes.) */
data class ApiBaseUrl(val value: String) {
    init {
        require(value.startsWith("https://") || value.startsWith("http://localhost")) { "API must use HTTPS: $value" }
    }

    fun resolve(path: String): String = value.trimEnd('/') + "/" + path.trimStart('/')
}
