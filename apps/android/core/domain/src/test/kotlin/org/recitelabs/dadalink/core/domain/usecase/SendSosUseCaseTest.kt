package org.recitelabs.dadalink.core.domain.usecase

import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import org.recitelabs.dadalink.core.domain.safety.SosMessageLabels
import org.recitelabs.dadalink.core.model.SosChannel
import org.recitelabs.dadalink.core.model.SosChannelResult
import org.recitelabs.dadalink.core.model.UserSettings
import org.recitelabs.dadalink.core.testing.TestData
import org.recitelabs.dadalink.core.testing.fake.FakeLocationProvider
import org.recitelabs.dadalink.core.testing.fake.FakeSettingsRepository
import org.recitelabs.dadalink.core.testing.fake.FakeSosRelay
import java.time.Clock
import java.time.Instant
import java.time.ZoneOffset

class SendSosUseCaseTest {
    private val labels = SosMessageLabels("Location", "Time", "unknown")
    private val clock = Clock.fixed(Instant.parse("2026-10-31T11:32:00Z"), ZoneOffset.UTC)
    private val settings = FakeSettingsRepository(UserSettings(isOnboarded = true, trustedContact = TestData.almaz))
    private val relay = FakeSosRelay()
    private val location = FakeLocationProvider(TestData.riyadh)

    private fun useCase() = SendSosUseCase(settings, location, relay, clock)

    @Test fun `relays with location and hands the sms to the user`() = runTest {
        val outcome = (useCase()("Meron needs help.", labels) as SendSosResult.Done).outcome

        assertEquals(outcome.alert, relay.relayed.single())
        assertTrue(outcome.alert.message.contains("maps.google.com/?q=24.71360,46.67530"))
        assertEquals(TestData.almaz.phone, outcome.alert.contact.phone)
        assertEquals(listOf(SosChannelResult.Sent(SosChannel.RELAY)), outcome.results)
        assertTrue(outcome.delivered)
        // The app never sends SMS itself (no SEND_SMS): the UI always opens the SMS app.
        assertTrue(outcome.needsShareFallback)
    }

    @Test fun `failed relay still opens the sms app`() = runTest {
        relay.result = SosChannelResult.Failed(SosChannel.RELAY, "down")

        val outcome = (useCase()("Help", labels) as SendSosResult.Done).outcome

        assertFalse(outcome.delivered)
        assertTrue(outcome.needsShareFallback)
    }

    @Test fun `queued relay still counts as delivered`() = runTest {
        relay.result = SosChannelResult.Queued(SosChannel.RELAY)

        val outcome = (useCase()("Help", labels) as SendSosResult.Done).outcome

        assertTrue(outcome.delivered)
        assertTrue(outcome.needsShareFallback)
    }

    @Test fun `no trusted contact`() = runTest {
        settings.setTrustedContact(null)
        assertEquals(SendSosResult.NoTrustedContact, useCase()("Help", labels))
    }
}
