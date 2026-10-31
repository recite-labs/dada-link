package org.recitelabs.dadalink.core.model

/** Destination and origin countries covered by the prototype. */
enum class Country(val isoCode: String, val englishName: String) {
    SAUDI_ARABIA("SA", "Saudi Arabia"),
    UAE("AE", "United Arab Emirates"),
    KUWAIT("KW", "Kuwait"),
    QATAR("QA", "Qatar"),
    LEBANON("LB", "Lebanon"),
    JORDAN("JO", "Jordan"),
    ETHIOPIA("ET", "Ethiopia"),
    ;

    companion object {
        fun fromIso(code: String?): Country? = entries.firstOrNull { it.isoCode.equals(code, ignoreCase = true) }
    }
}
