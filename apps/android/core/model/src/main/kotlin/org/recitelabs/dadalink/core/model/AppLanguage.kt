package org.recitelabs.dadalink.core.model

/** UI languages. [tag] is the BCP-47 tag used for Android per-app locales. */
enum class AppLanguage(
    val tag: String,
    /** Endonym, always shown in its own script so a user can find her language. */
    val endonym: String,
    val isEthiopicScript: Boolean,
    val isAvailable: Boolean,
) {
    AMHARIC("am", "አማርኛ", isEthiopicScript = true, isAvailable = true),
    OROMO("om", "Afaan Oromoo", isEthiopicScript = false, isAvailable = true),
    ENGLISH("en", "English", isEthiopicScript = false, isAvailable = true),
    SWAHILI("sw", "Kiswahili", isEthiopicScript = false, isAvailable = false),
    ;

    companion object {
        val Default = ENGLISH

        fun fromTag(tag: String?): AppLanguage? = entries.firstOrNull { it.tag.equals(tag, ignoreCase = true) }
    }
}
