package org.recitelabs.dadalink.feature.help

import app.cash.turbine.test
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Rule
import org.junit.Test
import org.recitelabs.dadalink.core.model.Country
import org.recitelabs.dadalink.core.testing.MainDispatcherRule
import org.recitelabs.dadalink.core.testing.TestData
import org.recitelabs.dadalink.core.testing.fake.FakeContentRepository
import org.recitelabs.dadalink.core.testing.fake.FakeSettingsRepository

class HelpViewModelTest {
    @get:Rule val main = MainDispatcherRule()

    @Test fun `follows the selected country`() = runTest {
        val settings = FakeSettingsRepository()
        val viewModel = HelpViewModel(settings, FakeContentRepository())

        viewModel.uiState.test {
            // With an unconfined dispatcher the Loading state may already be replaced.
            var first = awaitItem()
            if (first is HelpUiState.Loading) first = awaitItem()
            val ready = first as HelpUiState.Ready
            assertEquals(TestData.saudiDirectory, ready.directory)

            viewModel.selectCountry(Country.LEBANON)
            val lebanon = awaitItem() as HelpUiState.Ready
            assertEquals(Country.LEBANON, lebanon.country)
            assertNull(lebanon.directory)
        }
    }
}
