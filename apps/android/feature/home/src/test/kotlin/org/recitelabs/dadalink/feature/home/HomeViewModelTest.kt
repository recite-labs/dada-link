package org.recitelabs.dadalink.feature.home

import app.cash.turbine.test
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Rule
import org.junit.Test
import org.recitelabs.dadalink.core.domain.usecase.CheckInUseCase
import org.recitelabs.dadalink.core.model.Mood
import org.recitelabs.dadalink.core.model.UserSettings
import org.recitelabs.dadalink.core.testing.MainDispatcherRule
import org.recitelabs.dadalink.core.testing.TestData
import org.recitelabs.dadalink.core.testing.fake.FakeSettingsRepository
import java.time.Clock
import java.time.Instant
import java.time.ZoneOffset

class HomeViewModelTest {
    @get:Rule val main = MainDispatcherRule()

    private val settings = FakeSettingsRepository(UserSettings(isOnboarded = true, nickname = "Meron", trustedContact = TestData.almaz))
    private val clock = Clock.fixed(Instant.parse("2026-10-31T09:00:00Z"), ZoneOffset.UTC)
    private val viewModel = HomeViewModel(settings, CheckInUseCase(settings, clock))

    @Test fun `exposes greeting data and in-memory mood`() = runTest {
        viewModel.uiState.test {
            assertEquals(null, awaitItem().nickname) // initial
            assertEquals("Meron", awaitItem().nickname)
            viewModel.selectMood(Mood.LOW)
            assertEquals(Mood.LOW, awaitItem().mood)
        }
    }

    @Test fun `check-in records the time`() = runTest {
        viewModel.onCheckedIn()
        assertNotNull(settings.settings.first().lastCheckIn)
        assertEquals(clock.instant(), settings.settings.first().lastCheckIn)
    }
}
