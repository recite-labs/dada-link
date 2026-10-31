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
import org.recitelabs.dadalink.core.testing.fake.FakeSmsGateway
import org.recitelabs.dadalink.core.testing.fake.FakeSosRelay
import java.time.Clock
import java.time.Instant
import java.time.ZoneOffset

class SendSosUseCaseTest {
    private val labels = SosMessageLabels("Location", "Time", "unknown")
    private val clock = Clock.fixed(Instant.parse("2026-10-31T11:32:00Z"), ZoneOffset.UTC)
    private val settings = FakeSettingsRepository(UserSettings(isOnboarded = true, trustedContact = TestData.almaz))
    private val sms = FakeSmsGateway()
    private val relay = FakeSosRelay()
    private val location = FakeLocationProvider(TestData.riyadh)

    private fun useCase() = SendSosUseCase(settings, location, sms, relay, clock)

    @Test fun `sends sms and relay with location`() = runTest {
        val result = useCase()("Meron needs help.", labels) as SendSosResult.Done

        assertEquals(TestData.almaz.phone, sms.sent.single().first)
        assertTrue(sms.sent.single().second.contains("maps.google.com/?q=24.71360,46.67530"))
        assertEquals(result.outcome.alert, relay.relayed.single())
        assertTrue(result.outcome.delivered)
        assertFalse(result.outcome.needsShareFallback)
    }

    @Test fun `without sms permission asks for the share fallback but still relays`() = runTest {
        sms.permitted = false

        val outcome = (useCase()("Help", labels) as SendSosResult.Done).outcome

        assertTrue(sms.sent.isEmpty())
        assertTrue(outcome.needsShareFallback)
        assertEquals(SosChannelResult.Sent(SosChannel.RELAY), outcome.results.last())
    }

    @Test fun `queued relay still counts as delivered`() = runTest {
        sms.fail = true
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
