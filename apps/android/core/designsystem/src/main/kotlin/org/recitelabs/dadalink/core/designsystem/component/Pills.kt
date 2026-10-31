package org.recitelabs.dadalink.core.designsystem.component

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Icon
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import org.recitelabs.dadalink.core.designsystem.theme.DadaTheme
import org.recitelabs.dadalink.core.designsystem.theme.MinTouchTarget

/** Compact pill action (language switcher, black "Hide" quick-exit). Keeps a 48dp touch target. */
@Composable
fun DadaPill(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    containerColor: Color = DadaTheme.colors.surface,
    contentColor: Color = DadaTheme.colors.ink,
    border: BorderStroke? = BorderStroke(1.dp, DadaTheme.colors.line),
    leadingIcon: ImageVector? = null,
) {
    Surface(
        onClick = onClick,
        modifier = modifier
            .defaultMinSize(minHeight = MinTouchTarget)
            .semantics { role = Role.Button },
        shape = DadaTheme.shapes.pill,
        color = containerColor,
        contentColor = contentColor,
        border = border,
    ) {
        Row(
            modifier = Modifier.padding(PaddingValues(horizontal = 14.dp, vertical = 10.dp)),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp),
        ) {
            if (leadingIcon != null) {
                Icon(leadingIcon, contentDescription = null, modifier = Modifier.size(18.dp))
            }
            Text(text = text, style = DadaTheme.typography.label)
        }
    }
}

/** Black quick-exit pill shown in the top bar of every screen. */
@Composable
fun HidePill(text: String, onClick: () -> Unit, modifier: Modifier = Modifier) {
    DadaPill(
        text = text,
        onClick = onClick,
        modifier = modifier,
        containerColor = DadaTheme.colors.ink,
        contentColor = DadaTheme.colors.ground,
        border = null,
        leadingIcon = org.recitelabs.dadalink.core.designsystem.icon.DadaIcons.Hide,
    )
}

/** Small non-interactive status badge, e.g. "Encrypted · on this phone only". */
@Composable
fun DadaBadge(
    text: String,
    modifier: Modifier = Modifier,
    icon: ImageVector? = null,
    containerColor: Color = DadaTheme.colors.safeTint,
    contentColor: Color = DadaTheme.colors.safe,
) {
    Surface(modifier = modifier, shape = DadaTheme.shapes.pill, color = containerColor, contentColor = contentColor) {
        Row(
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp),
        ) {
            if (icon != null) Icon(icon, contentDescription = null, modifier = Modifier.size(14.dp))
            Text(text = text, style = DadaTheme.typography.caption)
        }
    }
}
