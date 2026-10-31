package org.recitelabs.dadalink.core.data

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test
import org.recitelabs.dadalink.core.data.repository.SyncedContentMapper
import org.recitelabs.dadalink.core.data.sync.toEntity
import org.recitelabs.dadalink.core.model.AppLanguage
import org.recitelabs.dadalink.core.model.ArticleCategory
import org.recitelabs.dadalink.core.model.Country
import org.recitelabs.dadalink.core.model.HelpContactKind

class SyncedContentMapperTest {
    private val rows = Dtos.saudi.mapIndexed { i, dto -> dto.toEntity(i) }

    @Test fun `first dialable emergency entry is the big card, the rest are grouped in order`() {
        val directory = SyncedContentMapper.directory(Country.SAUDI_ARABIA, rows, AppLanguage.AMHARIC)!!

        assertEquals("911", directory.emergency.phone)
        assertEquals("የተዋሃደ የአስቸኳይ ጊዜ ቁጥር", directory.emergency.name)
        assertEquals(
            listOf(HelpContactKind.EMERGENCY, HelpContactKind.EMBASSY, HelpContactKind.LABOUR, HelpContactKind.SUPPORT),
            directory.sections.map { it.group },
        )
        assertEquals(listOf("sa-police"), directory.sections.first().contacts.map { it.id })
        assertEquals("+966114823919", directory.embassy?.phone)
        assertEquals("19911", directory.sections[2].contacts.single().phone) // short code preferred
        assertNull(directory.sections[3].contacts.last().phone) // IOM: no number, shown as pending
    }

    @Test fun `english readers get the notes, others a neutral description`() {
        val en = SyncedContentMapper.directory(Country.SAUDI_ARABIA, rows, AppLanguage.ENGLISH)!!
        val am = SyncedContentMapper.directory(Country.SAUDI_ARABIA, rows, AppLanguage.AMHARIC)!!
        assertEquals("Labour complaints", en.sections[2].contacts.single().description)
        assertEquals("", am.sections[2].contacts.single().description)
        assertEquals("sa unified emergency", en.emergency.name) // no translation → server name
    }

    @Test fun `no dialable emergency number means no synced directory`() {
        assertNull(SyncedContentMapper.directory(Country.SAUDI_ARABIA, rows.filterNot { it.emergency }, AppLanguage.ENGLISH))
    }

    @Test fun `unknown directory kinds are grouped as other`() {
        assertEquals(HelpContactKind.OTHER, SyncedContentMapper.kindOf("space-agency"))
    }

    @Test fun `content lands in the right sections`() {
        fun cats(kind: String, phase: String?, vararg topics: String) =
            SyncedContentMapper.categoriesOf(Dtos.content("x", kind, phase, topics = topics.toList()).toEntity("en", 0))

        assertEquals(setOf(ArticleCategory.RIGHTS), cats("rights", null, "rights"))
        assertEquals(setOf(ArticleCategory.RIGHTS), cats("article", "abroad", "abuse"))
        assertEquals(setOf(ArticleCategory.HEALTH), cats("article", "abroad", "srh"))
        assertEquals(setOf(ArticleCategory.BEFORE_YOU_GO), cats("article", "before", "agencies"))
        assertEquals(setOf(ArticleCategory.RETURN, ArticleCategory.HEALTH), cats("article", "return", "mental-health"))
        assertEquals(emptySet<ArticleCategory>(), cats("faq", null, "wages"))
        assertEquals(setOf(ArticleCategory.HEALTH), cats("faq", null, "health"))
    }

    @Test fun `country filter keeps items for that country or for everyone`() {
        val saOnly = Dtos.content("a", countries = listOf("SA")).toEntity("en", 0)
        val everyone = Dtos.content("b", countries = emptyList()).toEntity("en", 1)
        assertEquals(true, SyncedContentMapper.appliesTo(saOnly, Country.SAUDI_ARABIA))
        assertEquals(false, SyncedContentMapper.appliesTo(saOnly, Country.LEBANON))
        assertEquals(true, SyncedContentMapper.appliesTo(everyone, Country.LEBANON))
        assertEquals(Country.SAUDI_ARABIA, SyncedContentMapper.article(saOnly).country)
    }
}
