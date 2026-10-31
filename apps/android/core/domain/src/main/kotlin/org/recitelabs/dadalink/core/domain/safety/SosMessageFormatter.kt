package org.recitelabs.dadalink.core.domain.safety

import org.recitelabs.dadalink.core.model.GeoPoint
import java.time.Instant
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter
import java.util.Locale
import kotlin.math.roundToInt

/** Localised labels supplied by the UI layer (string resources). */
data class SosMessageLabels(val location: String, val time: String, val locationUnknown: String)

/** Builds the SOS text: user's message, map link, accuracy and UTC time. Kept short for one SMS when possible. */
object SosMessageFormatter {
    private val timeFormat = DateTimeFormatter.ofPattern("d MMM HH:mm 'UTC'", Locale.ENGLISH).withZone(ZoneOffset.UTC)

    fun format(baseMessage: String, location: GeoPoint?, at: Instant, labels: SosMessageLabels): String = buildString {
        append(baseMessage.trim())
        append('\n')
        if (location != null) {
            append(labels.location).append(": ").append(mapLink(location))
            location.accuracyMeters?.let { append(" (±").append(it.roundToInt()).append(" m)") }
        } else {
            append(labels.location).append(": ").append(labels.locationUnknown)
        }
        append('\n')
        append(labels.time).append(": ").append(timeFormat.format(at))
    }

    fun mapLink(point: GeoPoint): String =
        "https://maps.google.com/?q=%.5f,%.5f".format(Locale.ROOT, point.latitude, point.longitude)
}
