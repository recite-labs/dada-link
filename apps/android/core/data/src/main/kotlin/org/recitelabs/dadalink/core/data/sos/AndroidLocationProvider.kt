package org.recitelabs.dadalink.core.data.sos

import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.pm.PackageManager
import android.location.Location
import android.location.LocationManager
import android.os.SystemClock
import androidx.core.content.ContextCompat
import androidx.core.location.LocationManagerCompat
import androidx.core.os.CancellationSignal
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.suspendCancellableCoroutine
import org.recitelabs.dadalink.core.domain.repository.LocationProvider
import org.recitelabs.dadalink.core.model.GeoPoint
import java.util.concurrent.Executors
import javax.inject.Inject
import kotlin.coroutines.resume

/**
 * Platform LocationManager only — no Google Play services, no third-party SDKs. Prefers a fresh
 * fix, falls back to the most recent known location.
 */
class AndroidLocationProvider @Inject constructor(@ApplicationContext private val context: Context) : LocationProvider {
    private val manager = ContextCompat.getSystemService(context, LocationManager::class.java)
    private val executor = Executors.newSingleThreadExecutor()

    @SuppressLint("MissingPermission") // checked in hasPermission()
    override suspend fun currentLocation(): GeoPoint? {
        val lm = manager ?: return null
        if (!hasPermission()) return null
        val providers = listOf(LocationManager.GPS_PROVIDER, LocationManager.NETWORK_PROVIDER).filter(lm::isProviderEnabled)
        val recent = providers.mapNotNull { runCatching { lm.getLastKnownLocation(it) }.getOrNull() }.maxByOrNull { it.time }
        if (recent != null && recent.ageMillis() < FRESH_MS) return recent.toGeoPoint()
        val provider = providers.firstOrNull() ?: return recent?.toGeoPoint()
        val fresh = suspendCancellableCoroutine { cont ->
            val signal = CancellationSignal()
            cont.invokeOnCancellation { signal.cancel() }
            LocationManagerCompat.getCurrentLocation(lm, provider, signal, executor) { location -> if (cont.isActive) cont.resume(location) }
        }
        return (fresh ?: recent)?.toGeoPoint()
    }

    private fun hasPermission() = listOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION)
        .any { ContextCompat.checkSelfPermission(context, it) == PackageManager.PERMISSION_GRANTED }

    private fun Location.ageMillis() = (SystemClock.elapsedRealtimeNanos() - elapsedRealtimeNanos) / 1_000_000

    private fun Location.toGeoPoint() = GeoPoint(latitude, longitude, if (hasAccuracy()) accuracy else null)

    private companion object {
        const val FRESH_MS = 2 * 60 * 1000L
    }
}
