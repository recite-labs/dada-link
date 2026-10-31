package org.recitelabs.dadalink.core.network

/** Base URL of the DadaLink API (same origin as the web app). A plain class: Dagger cannot inject value classes. */
data class ApiBaseUrl(val value: String) {
    init {
        require(value.startsWith("https://") || isLocalDev(value)) { "API must use HTTPS: $value" }
    }

    fun resolve(path: String): String = value.trimEnd('/') + "/" + path.trimStart('/')

    private companion object {
        /** Cleartext only for a server on the dev machine (emulator alias 10.0.2.2, or adb reverse). */
        val LOCAL = Regex("^http://(10\\.0\\.2\\.2|localhost|127\\.0\\.0\\.1)(:\\d+)?(/.*)?$")

        fun isLocalDev(url: String) = LOCAL.matches(url)
    }
}
