package org.recitelabs.dadalink.core.domain.usecase

import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Test
import org.recitelabs.dadalink.core.model.AgencyCheckResult
import org.recitelabs.dadalink.core.testing.TestData
import org.recitelabs.dadalink.core.testing.fake.FakeContentRepository

class CheckAgencyUseCaseTest {
    private val check = CheckAgencyUseCase(FakeContentRepository())

    @Test fun `finds a licensed agency by name`() = runTest {
        assertEquals(AgencyCheckResult.Found(TestData.licensedAgency), check("Selam employment"))
    }

    @Test fun `unknown agency is not found`() = runTest {
        assertEquals(AgencyCheckResult.NotFound, check("Unknown Broker"))
    }
}
