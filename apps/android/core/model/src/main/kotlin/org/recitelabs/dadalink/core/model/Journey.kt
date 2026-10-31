package org.recitelabs.dadalink.core.model

/** Stage of the migration journey. [wireValue] is the API's `JourneyPhase` literal. */
enum class JourneyPhase(val wireValue: String) {
    BEFORE("before"),
    ABROAD("abroad"),
    RETURN("return"),
    ;

    companion object {
        val Default = ABROAD

        fun fromWire(value: String?): JourneyPhase? = entries.firstOrNull { it.wireValue == value }
    }
}
