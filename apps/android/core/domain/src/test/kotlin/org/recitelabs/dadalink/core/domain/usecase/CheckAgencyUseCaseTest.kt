package org.recitelabs.dadalink.core.domain.usecase

import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import org.recitelabs.dadalink.core.model.AgencyCheckResult
import org.recitelabs.dadalink.core.testing.TestData
import org.recitelabs.dadalink.core.testing.fake.FakeAgencyRepository

class CheckAgencyUseCaseTest {
    private val agencies = FakeAgencyRepository()
    private val check = CheckAgencyUseCase(agencies)

    @Test fun `trims and checks the query`() = runTest {
        assertEquals(AgencyCheckResult.Found(TestData.licensedAgency), check("  Selam employment "))
        assertEquals(listOf("Selam employment"), agencies.queries)
    }

    @Test fun `unknown agency is not found`() = runTest {
        assertEquals(AgencyCheckResult.NotFound, check("Unknown Broker"))
    }

    @Test fun `blank queries never reach the registry and long ones are capped`() = runTest {
        assertEquals(AgencyCheckResult.NotFound, check("   "))
        check("x".repeat(500))
        assertTrue(agencies.queries.single().length == 200)
    }
}
