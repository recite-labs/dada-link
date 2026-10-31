package org.recitelabs.dadalink.core.data

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import org.recitelabs.dadalink.core.data.device.DeviceIdProvider
import org.recitelabs.dadalink.core.data.sos.RemoteSosRelay
import org.recitelabs.dadalink.core.data.sos.toE164
import org.recitelabs.dadalink.core.data.sos.toRequest
import org.recitelabs.dadalink.core.model.AppLanguage
import org.recitelabs.dadalink.core.model.Country
import org.recitelabs.dadalink.core.model.GeoPoint
import org.recitelabs.dadalink.core.model.SosAlert
import org.recitelabs.dadalink.core.model.SosChannel
import org.recitelabs.dadalink.core.model.SosChannelResult
import org.recitelabs.dadalink.core.model.TrustedContact
import org.recitelabs.dadalink.core.network.ApiException
import org.recitelabs.dadalink.core.network.model.GeoLocationDto
import org.recitelabs.dadalink.core.network.model.SosResultDto
import org.recitelabs.dadalink.core.network.model.TrustedContactDto
import org.recitelabs.dadalink.core.security.SecretCipher
import org.robolectric.RobolectricTestRunner
import java.time.Instant

@RunWith(RobolectricTestRunner::class)
class SosRelayTest {
    private val alert = SosAlert(
        message = "Meron needs help.\nLocation: https://maps.google.com/?q=24.7,46.6\nTime: 11:32",
        location = GeoPoint(24.7136, 46.6753, 18f),
        createdAt = Instant.parse("2026-10-31T11:32:00Z"),
        contact = TrustedContact("Almaz", "Sister", "+251 911-000 000", "@almaz_t"),
        note = "Meron needs help.",
        language = AppLanguage.AMHARIC,
        country = Country.SAUDI_ARABIA,
    )

    @Test fun `normalises to strict E164 or nothing`() {
        assertEquals("+251911000000", toE164("+251 911-000 000"))
        assertEquals("+251911000000", toE164("00251911000000"))
        assertNull(toE164("0911000000")) // local format: the server cannot know the country code
        assertNull(toE164("+0123456789"))
    }

    @Test fun `request carries the plain note, not the phone's formatted SMS`() {
        val request = alert.toRequest("0b6c6b1e-0d55-4e8e-9f3a-2f7a1c9d8e01")!!
        assertEquals("am", request.locale)
        assertEquals("SA", request.country)
        assertEquals("Meron needs help.", request.message)
        assertEquals(TrustedContactDto(phone = "+251911000000"), request.trustedContact) // @username is not a chat id
        assertEquals(GeoLocationDto(24.7136, 46.6753, 18.0), request.location)
    }

    @Test fun `numeric telegram chat id is used, no channel means no request`() {
        val telegramOnly = alert.copy(contact = TrustedContact("A", "B", "0911", "123456789"))
        assertEquals(TrustedContactDto(telegramChatId = 123456789), telegramOnly.toRequest("id")!!.trustedContact)
        assertNull(alert.copy(contact = TrustedContact("A", "B", "0911", "@x")).toRequest("id"))
    }

    private fun relay(api: FakeSosApi) = RemoteSosRelay(
        ApplicationProvider.getApplicationContext<Context>(),
        api,
        DeviceIdProvider(settingsSource()),
        object : SecretCipher {
            override fun encrypt(plaintext: ByteArray) = plaintext
            override fun decrypt(ciphertext: ByteArray) = ciphertext
        },
    )

    @Test fun `delivered, undelivered and refused relays`() = runTest {
        assertEquals(SosChannelResult.Sent(SosChannel.RELAY), relay(FakeSosApi()).relay(alert))
        assertTrue(relay(FakeSosApi { SosResultDto(emptyList(), listOf("sms")) }).relay(alert) is SosChannelResult.Failed)
        assertTrue(relay(FakeSosApi { throw ApiException.Upstream("sms") }).relay(alert) is SosChannelResult.Failed)
        assertTrue(relay(FakeSosApi { throw ApiException.RateLimited("sos", 60) }).relay(alert) is SosChannelResult.Failed)
    }

    @Test fun `contact without a usable channel fails without calling the server`() = runTest {
        val api = FakeSosApi()
        val result = relay(api).relay(alert.copy(contact = TrustedContact("A", "B", "0911", null)))
        assertTrue(result is SosChannelResult.Failed)
        assertTrue(api.requests.isEmpty())
    }
}
