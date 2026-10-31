package org.recitelabs.dadalink.core.ui

import androidx.compose.ui.text.font.FontWeight
import org.junit.Assert.assertEquals
import org.junit.Test

class SimpleMarkdownTest {
    @Test fun `headings, bold and bullets`() {
        val text = simpleMarkdown("## What to do\n- Press **SOS** now\nCall 911")

        assertEquals("What to do\n•  Press SOS now\nCall 911", text.text)
        val bold = text.spanStyles.filter { it.item.fontWeight == FontWeight.Bold }.map { text.text.substring(it.start, it.end) }
        assertEquals(listOf("What to do", "SOS"), bold)
    }

    @Test fun `unclosed bold is shown as written`() {
        assertEquals("I'm **so", simpleMarkdown("I'm **so").text)
    }
}
