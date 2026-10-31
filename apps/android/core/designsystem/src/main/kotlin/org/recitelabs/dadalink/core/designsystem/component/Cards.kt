package org.recitelabs.dadalink.core.designsystem.component

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Icon
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import org.recitelabs.dadalink.core.designsystem.theme.DadaTheme

/** Surface card with optional click. Defaults: lavender surface, hairline border, 16dp radius. */
@Composable
fun DadaCard(
    modifier: Modifier = Modifier,
    onClick: (() -> Unit)? = null,
    containerColor: Color = DadaTheme.colors.surface,
    contentColor: Color = DadaTheme.colors.ink,
    border: BorderStroke? = null,
    shape: Shape = DadaTheme.shapes.card,
    contentPadding: Dp = 16.dp,
    content: @Composable ColumnScope.() -> Unit,
) {
    val inner: @Composable () -> Unit = {
        Column(modifier = Modifier.padding(contentPadding), content = content)
    }
    if (onClick != null) {
        Surface(
            onClick = onClick,
            modifier = modifier,
            shape = shape,
            color = containerColor,
            contentColor = contentColor,
            border = border,
            content = inner,
        )
    } else {
        Surface(
            modifier = modifier,
            shape = shape,
            color = containerColor,
            contentColor = contentColor,
            border = border,
            content = inner,
        )
    }
}

/** Round icon container used by tiles and list rows. */
@Composable
fun IconBadge(
    icon: ImageVector,
    modifier: Modifier = Modifier,
    containerColor: Color = DadaTheme.colors.tint,
    contentColor: Color = DadaTheme.colors.primary,
    size: Dp = 40.dp,
) {
    Box(
        modifier = modifier
            .size(size)
            .background(containerColor, DadaTheme.shapes.pill),
        contentAlignment = Alignment.Center,
    ) {
        Icon(icon, contentDescription = null, tint = contentColor, modifier = Modifier.size(size * 0.5f))
    }
}

/** Home 2x2 tile: icon, title, one-line subtitle. */
@Composable
fun DadaTile(
    title: String,
    subtitle: String,
    icon: ImageVector,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    DadaCard(
        modifier = modifier.defaultMinSize(minHeight = 120.dp),
        onClick = onClick,
        containerColor = DadaTheme.colors.ground,
        border = BorderStroke(1.dp, DadaTheme.colors.line),
        shape = DadaTheme.shapes.cardLarge,
    ) {
        IconBadge(icon)
        Column(modifier = Modifier.padding(top = 14.dp), verticalArrangement = Arrangement.spacedBy(2.dp)) {
            Text(text = title, style = DadaTheme.typography.titleSmall, color = DadaTheme.colors.ink)
            Text(text = subtitle, style = DadaTheme.typography.caption, color = DadaTheme.colors.muted)
        }
    }
}

/** Full-width list row with icon, title/subtitle and trailing content. */
@Composable
fun DadaListRow(
    title: String,
    modifier: Modifier = Modifier,
    subtitle: String? = null,
    icon: ImageVector? = null,
    onClick: (() -> Unit)? = null,
    trailing: @Composable (() -> Unit)? = null,
) {
    DadaCard(
        modifier = modifier.fillMaxWidth().defaultMinSize(minHeight = 64.dp),
        onClick = onClick,
        containerColor = DadaTheme.colors.ground,
        border = BorderStroke(1.dp, DadaTheme.colors.line),
        contentPadding = 14.dp,
    ) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            if (icon != null) IconBadge(icon)
            Column(modifier = Modifier.weight(1f)) {
                Text(text = title, style = DadaTheme.typography.titleSmall, color = DadaTheme.colors.ink)
                if (subtitle != null) {
                    Text(text = subtitle, style = DadaTheme.typography.caption, color = DadaTheme.colors.muted)
                }
            }
            if (trailing != null) trailing()
        }
    }
}

@Composable
fun SectionHeader(text: String, modifier: Modifier = Modifier, trailing: @Composable (() -> Unit)? = null) {
    Row(
        modifier = modifier.fillMaxWidth().padding(top = 8.dp, bottom = 4.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(
            text = text,
            style = DadaTheme.typography.titleSmall,
            color = DadaTheme.colors.ink,
            modifier = Modifier.weight(1f),
        )
        if (trailing != null) trailing()
    }
}
