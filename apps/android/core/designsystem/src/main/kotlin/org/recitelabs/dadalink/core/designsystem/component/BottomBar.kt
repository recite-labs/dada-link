package org.recitelabs.dadalink.core.designsystem.component

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import org.recitelabs.dadalink.core.designsystem.theme.DadaTheme

data class BottomBarItem(
    val key: String,
    val label: String,
    val icon: ImageVector,
)

/**
 * Bottom navigation with a raised red SOS circle in the middle. Items are split evenly around the
 * SOS button (two left, two right in the designs).
 */
@Composable
fun DadaBottomBar(
    items: List<BottomBarItem>,
    selectedKey: String?,
    onSelect: (BottomBarItem) -> Unit,
    sosLabel: String,
    onSos: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val half = items.size / 2
    Surface(modifier = modifier.fillMaxWidth(), color = DadaTheme.colors.ground) {
        Column {
            HorizontalDivider(color = DadaTheme.colors.line)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .navigationBarsPadding()
                    .height(68.dp)
                    .padding(horizontal = 8.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceAround,
            ) {
                items.take(half).forEach { item ->
                    BottomItem(item, item.key == selectedKey, Modifier.weight(1f)) { onSelect(item) }
                }
                Box(modifier = Modifier.weight(1f), contentAlignment = Alignment.Center) {
                    SosFab(label = sosLabel, onClick = onSos, modifier = Modifier.offset(y = (-14).dp))
                }
                items.drop(half).forEach { item ->
                    BottomItem(item, item.key == selectedKey, Modifier.weight(1f)) { onSelect(item) }
                }
            }
        }
    }
}

@Composable
private fun BottomItem(item: BottomBarItem, selected: Boolean, modifier: Modifier, onClick: () -> Unit) {
    val color = if (selected) DadaTheme.colors.primary else DadaTheme.colors.muted
    Column(
        modifier = modifier
            .height(56.dp)
            .selectable(selected = selected, role = Role.Tab, onClick = onClick),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Icon(item.icon, contentDescription = null, tint = color, modifier = Modifier.size(24.dp))
        Text(
            text = item.label,
            style = DadaTheme.typography.caption,
            fontWeight = if (selected) FontWeight.Bold else FontWeight.Medium,
            color = color,
        )
    }
}

/** Raised circular SOS button. */
@Composable
fun SosFab(label: String, onClick: () -> Unit, modifier: Modifier = Modifier) {
    Box(
        modifier = modifier
            .size(64.dp)
            .shadow(8.dp, CircleShape, ambientColor = DadaTheme.colors.sos, spotColor = DadaTheme.colors.sos)
            .background(DadaTheme.colors.sos, CircleShape)
            .border(4.dp, DadaTheme.colors.ground, CircleShape)
            .selectable(selected = false, role = Role.Button, onClick = onClick)
            .semantics { contentDescription = label },
        contentAlignment = Alignment.Center,
    ) {
        Text(text = "SOS", style = DadaTheme.typography.label, fontWeight = FontWeight.ExtraBold, color = DadaTheme.colors.onSos)
    }
}
