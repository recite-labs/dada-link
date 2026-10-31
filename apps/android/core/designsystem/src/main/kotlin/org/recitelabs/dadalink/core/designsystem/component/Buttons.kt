package org.recitelabs.dadalink.core.designsystem.component

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import org.recitelabs.dadalink.core.designsystem.theme.DadaTheme

private val ButtonHeight = 56.dp
private val ButtonPadding = PaddingValues(horizontal = 24.dp, vertical = 14.dp)

enum class DadaButtonStyle { Primary, Secondary, Danger, Safe, Dark }

/** Pill-shaped, 56dp-tall primary action. */
@Composable
fun DadaButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    style: DadaButtonStyle = DadaButtonStyle.Primary,
    enabled: Boolean = true,
    leadingIcon: ImageVector? = null,
) {
    val colors = DadaTheme.colors
    val (container, content) = when (style) {
        DadaButtonStyle.Primary -> colors.primary to colors.onPrimary
        DadaButtonStyle.Secondary -> colors.tint to colors.primary
        DadaButtonStyle.Danger -> colors.sos to colors.onSos
        DadaButtonStyle.Safe -> colors.safe to colors.onPrimary
        DadaButtonStyle.Dark -> colors.ink to colors.ground
    }
    Button(
        onClick = onClick,
        modifier = modifier.defaultMinSize(minHeight = ButtonHeight),
        enabled = enabled,
        shape = DadaTheme.shapes.pill,
        contentPadding = ButtonPadding,
        colors = ButtonDefaults.buttonColors(
            containerColor = container,
            contentColor = content,
            disabledContainerColor = colors.line,
            disabledContentColor = colors.muted,
        ),
    ) {
        ButtonContent(text, leadingIcon)
    }
}

@Composable
fun DadaOutlinedButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    leadingIcon: ImageVector? = null,
    contentColor: Color = DadaTheme.colors.ink,
) {
    OutlinedButton(
        onClick = onClick,
        modifier = modifier.defaultMinSize(minHeight = ButtonHeight),
        enabled = enabled,
        shape = DadaTheme.shapes.pill,
        contentPadding = ButtonPadding,
        border = BorderStroke(1.dp, DadaTheme.colors.line),
        colors = ButtonDefaults.outlinedButtonColors(contentColor = contentColor),
    ) {
        ButtonContent(text, leadingIcon)
    }
}

@Composable
fun DadaTextButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    color: Color = DadaTheme.colors.primary,
) {
    TextButton(
        onClick = onClick,
        modifier = modifier.defaultMinSize(minHeight = 48.dp),
        colors = ButtonDefaults.textButtonColors(contentColor = color),
    ) {
        Text(text = text, style = DadaTheme.typography.label)
    }
}

@Composable
private fun ButtonContent(text: String, leadingIcon: ImageVector?) {
    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.Center) {
        if (leadingIcon != null) {
            Icon(imageVector = leadingIcon, contentDescription = null, modifier = Modifier.size(20.dp))
            Spacer(Modifier.width(8.dp))
        }
        Text(text = text, style = DadaTheme.typography.label, textAlign = TextAlign.Center)
    }
}
