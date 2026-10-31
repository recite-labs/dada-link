package org.recitelabs.dadalink.core.network

/** Paths of the DadaLink API used by the app (see packages/api/openapi.json; checked by OpenApiContractTest). */
object ApiRoutes {
    const val HEALTH = "/health"
    const val CONTENT = "/content"
    const val CONTENT_ITEM = "/content/{id}"
    const val DIRECTORY = "/directory/{country}"
    const val DIRECTORY_EMERGENCY = "/directory/{country}/emergency"
    const val AGENCIES_CHECK = "/agencies/check"
    const val ASSISTANT_ASK = "/assistant/ask"
    const val ASSISTANT_ASK_STREAM = "/assistant/ask/stream"
    const val ASSISTANT_FEEDBACK = "/assistant/feedback"
    const val SAFETY_SOS = "/safety/sos"

    /** (method, path) pairs, for the contract test. */
    val all: List<Pair<String, String>> = listOf(
        "get" to HEALTH,
        "get" to CONTENT,
        "get" to CONTENT_ITEM,
        "get" to DIRECTORY,
        "get" to DIRECTORY_EMERGENCY,
        "get" to AGENCIES_CHECK,
        "post" to ASSISTANT_ASK,
        "post" to ASSISTANT_ASK_STREAM,
        "post" to ASSISTANT_FEEDBACK,
        "post" to SAFETY_SOS,
    )

    /** Fills `{name}` placeholders with URL-encoded values. */
    fun path(template: String, vararg params: Pair<String, String>): String =
        params.fold(template) { acc, (k, v) -> acc.replace("{$k}", java.net.URLEncoder.encode(v, Charsets.UTF_8.name()).replace("+", "%20")) }
}
