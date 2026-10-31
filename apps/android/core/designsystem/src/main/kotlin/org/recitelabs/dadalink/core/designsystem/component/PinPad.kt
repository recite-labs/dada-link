package org.recitelabs.dadalink.core.designsystem.component

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Icon
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import org.recitelabs.dadalink.core.designsystem.icon.DadaIcons
import org.recitelabs.dadalink.core.designsystem.theme.DadaTheme

/** Row of dots showing how many PIN digits were entered (never the digits themselves). */
@Composable
fun PinDots(filled: Int, length: Int, modifier: Modifier = Modifier, isError: Boolean = false, description: String) {
    val colors = DadaTheme.colors
    Row(
        modifier = modifier.semantics { contentDescription = description },
        horizontalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        repeat(length) { index ->
            val on = index < filled
            Box(
                Modifier
                    .size(16.dp)
                    .background(
                        color = when {
                            isError -> colors.sos
                            on -> colors.primary
                            else -> colors.ground
                        },
                        shape = CircleShape,
                    )
                    .border(2.dp, if (isError) colors.sos else colors.primary, CircleShape),
            )
        }
    }
}

/** 3x4 numeric keypad with large (≥64dp) keys. */
@Composable
fun NumberPad(
    onDigit: (Char) -> Unit,
    onDelete: () -> Unit,
    deleteContentDescription: String,
    modifier: Modifier = Modifier,
) {
    val rows = listOf("123", "456", "789")
    Column(modifier = modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        rows.forEach { row ->
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                row.forEach { digit -> PadKey(Modifier.weight(1f), onClick = { onDigit(digit) }) { KeyText(digit.toString()) } }
            }
        }
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Spacer(Modifier.weight(1f))
            PadKey(Modifier.weight(1f), onClick = { onDigit('0') }) { KeyText("0") }
            PadKey(Modifier.weight(1f), onClick = onDelete, contentDescription = deleteContentDescription) {
                Icon(DadaIcons.Backspace, contentDescription = null, tint = DadaTheme.colors.ink)
            }
        }
    }
}

@Composable
private fun PadKey(
    modifier: Modifier,
    onClick: () -> Unit,
    contentDescription: String? = null,
    content: @Composable () -> Unit,
) {
    Surface(
        onClick = onClick,
        modifier = modifier
            .aspectRatio(1.6f)
            .then(if (contentDescription != null) Modifier.semantics { this.contentDescription = contentDescription } else Modifier),
        shape = DadaTheme.shapes.card,
        color = DadaTheme.colors.surface,
    ) {
        Box(contentAlignment = Alignment.Center) { content() }
    }
}

@Composable
private fun KeyText(text: String) {
    Text(text = text, style = DadaTheme.typography.headline, color = DadaTheme.colors.ink)
}
