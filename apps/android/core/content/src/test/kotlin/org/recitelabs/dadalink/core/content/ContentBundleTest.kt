package org.recitelabs.dadalink.core.content

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Assume.assumeTrue
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

    @Test fun `article ids are unique and statuses are known`() {
        assertEquals(bundle.articles.size, bundle.articles.map { it.id }.toSet().size)
        bundle.articles.forEach { a ->
            assertTrue(a.id, a.status in STATUSES)
            a.statuses.forEach { (lang, status) -> assertTrue("${a.id}.$lang", status in STATUSES) }
        }
    }

    @Test fun `bundle holds the reviewed content in english, amharic and oromo`() {
        val reviewed = bundle.articles.filter { it.status == "reviewed" }
        assertTrue("expected the reviewed content tree, got ${reviewed.size} reviewed articles", reviewed.size >= 50)
        val ids = bundle.articles.map { it.id }.toSet()
        listOf("rights-sa", "rights-et", "passport-taken", "unpaid-wages", "arriving-home").forEach { assertTrue(it, it in ids) }
        bundle.articles.forEach { a ->
            listOf("en", "am", "om").forEach { lang ->
                assertTrue("${a.id}.$lang", a.title.containsKey(lang) && a.body.containsKey(lang) && a.statuses.containsKey(lang))
            }
        }
        val categories = bundle.articles.flatMap { it.categories }.toSet()
        assertEquals(setOf("rights", "health", "before_you_go", "return"), categories)
    }

    @Test fun `no article is marked draft when its source file is reviewed`() {
        val sources = File("../../../../content")
        assumeTrue("content/ tree not available", sources.isDirectory)
        val byId = bundle.articles.associateBy { it.id }
        var checked = 0
        sources.walkTopDown()
            .filter { it.isFile && it.extension == "md" && it.name.count { c -> c == '.' } == 2 }
            .forEach { file ->
                val front = file.readText().substringAfter("---\n").substringBefore("\n---")
                fun field(name: String) = Regex("^$name:\\s*(\\S+)", RegexOption.MULTILINE).find(front)?.groupValues?.get(1)
                val id = field("id") ?: return@forEach
                val lang = field("locale") ?: return@forEach
                val sourceStatus = field("status") ?: return@forEach
                val article = byId[id]
                assertTrue("${file.path} is missing from the bundle", article != null)
                val shipped = article!!.statuses[lang] ?: article.status
                assertEquals("${file.path} status", sourceStatus, shipped)
                if (sourceStatus == "reviewed") assertTrue("$id.$lang shipped as draft", shipped == "reviewed")
                checked++
            }
        assertTrue("checked $checked source files", checked >= 99)
        assertTrue("reviewed sources ship as reviewed", bundle.articles.none { it.status == "draft" })
    }

    @Test fun `directory contacts carry a kind and keep the source verified flag`() {
        val contacts = bundle.directories.flatMap { dir ->
            dir.sections.forEach { assertTrue(dir.country, it.group != null) }
            dir.sections.flatMap { it.contacts } + dir.emergency
        }
        contacts.forEach { assertTrue(it.id, it.kind != null) }
        val sources = File("../../../../content/directory")
        assumeTrue("content/directory not available", sources.isDirectory)
        val verified = sources.listFiles { f -> f.extension == "yaml" }.orEmpty().flatMap { file ->
            file.readText().split(Regex("\n  - id: ")).drop(1).map { entry ->
                entry.substringBefore('\n').trim() to Regex("\\n    verified: (true|false)").find(entry)!!.groupValues[1].toBoolean()
            }
        }.toMap()
        assertEquals(verified.keys, contacts.map { it.id }.toSet())
        contacts.forEach { assertEquals(it.id, verified.getValue(it.id), it.verified) }
    }

    @Test fun `pick falls back to english`() {
        assertEquals("Hi", mapOf("en" to "Hi").pick("am"))
        assertEquals("ሰላም", mapOf("en" to "Hi", "am" to "ሰላም").pick("am"))
    }

    private companion object {
        val STATUSES = setOf("reviewed", "draft-ai", "draft")
    }
}
