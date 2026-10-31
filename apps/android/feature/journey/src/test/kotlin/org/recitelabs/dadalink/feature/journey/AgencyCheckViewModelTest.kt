package org.recitelabs.dadalink.feature.journey

import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Rule
import org.junit.Test
import org.recitelabs.dadalink.core.domain.usecase.CheckAgencyUseCase
import org.recitelabs.dadalink.core.model.AgencyCheckResult
import org.recitelabs.dadalink.core.testing.MainDispatcherRule
import org.recitelabs.dadalink.core.testing.TestData
import org.recitelabs.dadalink.core.testing.fake.FakeContentRepository
import org.recitelabs.dadalink.feature.journey.agency.AgencyCheckViewModel

class AgencyCheckViewModelTest {
    @get:Rule val main = MainDispatcherRule()
    private val vm = AgencyCheckViewModel(CheckAgencyUseCase(FakeContentRepository()))

    @Test fun `checks and clears the result when the query changes`() = runTest {
        vm.onQueryChange("MoLS/123/2024")
        vm.check()
        assertEquals(AgencyCheckResult.Found(TestData.licensedAgency), vm.uiState.value.result)

        vm.onQueryChange("Other")
        assertNull(vm.uiState.value.result)
        vm.check()
        assertEquals(AgencyCheckResult.NotFound, vm.uiState.value.result)
    }
}
