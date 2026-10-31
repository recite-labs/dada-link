package org.recitelabs.dadalink.core.content

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.File

/** Validates the shipped bundle: it must parse and respect the content rules. */
class ContentBundleTest {
    private val bundle = ContentBundleDataSource.parse(File("src/main/assets/content/bundle.json").readText())

    @Test fun `bundle parses and covers all destination countries`() {
        assertEquals(setOf("SA", "AE", "KW", "QA", "LB", "JO", "ET"), bundle.directories.map { it.country }.toSet())
    }

    @Test fun `every text has english and every emergency line has a number`() {
        bundle.directories.forEach { dir ->
            assertTrue(dir.country, dir.emergency.phone != null)
            dir.sections.forEach { section ->
                assertTrue(section.title.containsKey("en"))
                section.contacts.forEach { assertTrue(it.id, it.name.containsKey("en")) }
            }
        }
        bundle.articles.forEach { assertTrue(it.id, it.title.containsKey("en") && it.body.containsKey("en")) }
    }

    @Test fun `numbers contain only dialable characters`() {
        val all = bundle.directories.flatMap { d -> d.sections.flatMap { it.contacts } + d.emergency }
        all.mapNotNull { it.phone }.forEach { assertTrue(it, it.matches(Regex("^\\+?[0-9]{3,15}$"))) }
    }

    @Test fun `article ids are unique and unreviewed text is marked draft`() {
        assertEquals(bundle.articles.size, bundle.articles.map { it.id }.toSet().size)
        bundle.articles.filter { it.reviewedBy == null }.forEach { assertEquals(it.id, "draft", it.status) }
    }

    @Test fun `pick falls back to english`() {
        assertEquals("Hi", mapOf("en" to "Hi").pick("am"))
        assertEquals("ሰላም", mapOf("en" to "Hi", "am" to "ሰላም").pick("am"))
    }
}
