package org.recitelabs.dadalink.core.designsystem.component

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.selection.selectable
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.unit.dp
import org.recitelabs.dadalink.core.designsystem.theme.DadaTheme
import org.recitelabs.dadalink.core.designsystem.theme.MinTouchTarget

enum class ChipTone { Neutral, Danger }

/** Selectable chip (mood check-in, follow-up suggestions). The Danger tone uses the SOS tint. */
@Composable
fun DadaChip(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    selected: Boolean = false,
    tone: ChipTone = ChipTone.Neutral,
) {
    val colors = DadaTheme.colors
    val container = when {
        tone == ChipTone.Danger -> colors.sosTint
        selected -> colors.primary
        else -> colors.ground
    }
    val content = when {
        tone == ChipTone.Danger -> colors.sos
        selected -> colors.onPrimary
        else -> colors.ink
    }
    val border = when {
        tone == ChipTone.Danger -> BorderStroke(1.dp, colors.sos.copy(alpha = 0.25f))
        selected -> null
        else -> BorderStroke(1.dp, colors.line)
    }
    Surface(
        modifier = modifier
            .defaultMinSize(minHeight = MinTouchTarget)
            .selectable(selected = selected, role = Role.Button, onClick = onClick),
        shape = DadaTheme.shapes.pill,
        color = container,
        contentColor = content,
        border = border,
    ) {
        Text(
            text = text,
            style = DadaTheme.typography.label,
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 13.dp),
        )
    }
}
