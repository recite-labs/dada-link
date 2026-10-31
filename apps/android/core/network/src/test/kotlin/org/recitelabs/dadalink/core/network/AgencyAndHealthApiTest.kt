package org.recitelabs.dadalink.core.network

import io.ktor.http.HttpStatusCode
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class AgencyAndHealthApiTest {
    private val http = TestHttp()

    @Test fun `agency check not-found from the live registry`() = runTest {
        val result = KtorAgencyApi(http.client(fixture("agency.json")), http.baseUrl, http.json).check("abc")

        assertEquals("https://api.test/agencies/check?q=abc", http.requests.single().url)
        assertEquals("not-found", result.verdict)
        assertTrue(result.matches.isEmpty())
    }

    @Test fun `agency check with a match (schema-shaped fixture, live registry is empty)`() = runTest {
        val body = """
            {"query":"selam","verdict":"suspended","matches":[{"id":"et-mols-0042","name":"Selam Foreign Employment Agent PLC",
            "licenceNumber":null,"status":"suspended","region":"Addis Ababa","sourceUrl":"https://mols.gov.et/agencies"}]}
        """.trimIndent()
        val result = KtorAgencyApi(http.client(body), http.baseUrl, http.json).check("selam")

        val match = result.matches.single()
        assertNull(match.licenceNumber)
        assertEquals("suspended", match.status)
        assertEquals("Addis Ababa", match.region)
    }

    @Test fun `short query is rejected with the server's reason`() = runTest {
        val error = runCatching {
            KtorAgencyApi(http.client(fixture("agency_400.json"), HttpStatusCode.BadRequest), http.baseUrl, http.json).check("a")
        }.exceptionOrNull()
        assertEquals("Please enter at least 3 letters or digits", (error as ApiException.Invalid).reason)
    }

    @Test fun `health`() = runTest {
        val health = KtorHealthApi(http.client(fixture("health.json")), http.baseUrl, http.json).health()
        assertEquals("https://api.test/health", http.requests.single().url)
        assertEquals("ok", health.status)
        assertEquals("dadalink", health.service)
    }
}
