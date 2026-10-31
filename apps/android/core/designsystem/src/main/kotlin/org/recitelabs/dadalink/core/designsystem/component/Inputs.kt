package org.recitelabs.dadalink.core.designsystem.component

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.selection.toggleable
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.RadioButton
import androidx.compose.material3.RadioButtonDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.unit.dp
import org.recitelabs.dadalink.core.designsystem.theme.DadaTheme

@Composable
fun DadaTextField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    modifier: Modifier = Modifier,
    placeholder: String? = null,
    singleLine: Boolean = true,
    minLines: Int = 1,
    keyboardOptions: KeyboardOptions = KeyboardOptions.Default,
    keyboardActions: KeyboardActions = KeyboardActions.Default,
    isError: Boolean = false,
    supportingText: String? = null,
) {
    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        modifier = modifier.fillMaxWidth(),
        label = { Text(label) },
        placeholder = placeholder?.let { { Text(it, color = DadaTheme.colors.muted) } },
        singleLine = singleLine,
        minLines = minLines,
        keyboardOptions = keyboardOptions,
        keyboardActions = keyboardActions,
        isError = isError,
        supportingText = supportingText?.let { { Text(it) } },
        textStyle = DadaTheme.typography.body,
        shape = DadaTheme.shapes.card,
        colors = OutlinedTextFieldDefaults.colors(
            focusedBorderColor = DadaTheme.colors.primary,
            unfocusedBorderColor = DadaTheme.colors.line,
            focusedContainerColor = DadaTheme.colors.ground,
            unfocusedContainerColor = DadaTheme.colors.surface,
            focusedLabelColor = DadaTheme.colors.primary,
            unfocusedLabelColor = DadaTheme.colors.muted,
            cursorColor = DadaTheme.colors.primary,
        ),
    )
}

/** Settings-style row with a trailing switch; the whole row is the toggle target. */
@Composable
fun DadaSwitchRow(
    title: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit,
    modifier: Modifier = Modifier,
    subtitle: String? = null,
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .defaultMinSize(minHeight = 56.dp)
            .toggleable(value = checked, role = Role.Switch, onValueChange = onCheckedChange),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(title, style = DadaTheme.typography.titleSmall, color = DadaTheme.colors.ink)
            if (subtitle != null) Text(subtitle, style = DadaTheme.typography.caption, color = DadaTheme.colors.muted)
        }
        Switch(
            checked = checked,
            onCheckedChange = null,
            colors = SwitchDefaults.colors(
                checkedTrackColor = DadaTheme.colors.primary,
                uncheckedTrackColor = DadaTheme.colors.line,
                uncheckedBorderColor = DadaTheme.colors.line,
                uncheckedThumbColor = DadaTheme.colors.ground,
            ),
        )
    }
}

/** Radio card for single choice among a few options (language, disguise). */
@Composable
fun DadaChoiceCard(
    title: String,
    selected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    subtitle: String? = null,
    icon: ImageVector? = null,
    enabled: Boolean = true,
    trailingLabel: String? = null,
    titleFontFamily: FontFamily? = null,
) {
    val colors = DadaTheme.colors
    Surface(
        modifier = modifier
            .fillMaxWidth()
            .defaultMinSize(minHeight = 64.dp)
            .selectable(selected = selected, enabled = enabled, role = Role.RadioButton, onClick = onClick),
        shape = DadaTheme.shapes.card,
        color = if (selected) colors.tint else colors.ground,
        border = BorderStroke(if (selected) 2.dp else 1.dp, if (selected) colors.primary else colors.line),
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            if (icon != null) IconBadge(icon, size = 36.dp)
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    title,
                    style = DadaTheme.typography.titleSmall,
                    fontFamily = titleFontFamily ?: DadaTheme.typography.titleSmall.fontFamily,
                    color = if (enabled) colors.ink else colors.muted,
                )
                if (subtitle != null) Text(subtitle, style = DadaTheme.typography.caption, color = colors.muted)
            }
            if (trailingLabel != null) {
                DadaBadge(trailingLabel, containerColor = colors.surface, contentColor = colors.muted)
            } else {
                RadioButton(
                    selected = selected,
                    onClick = null,
                    enabled = enabled,
                    colors = RadioButtonDefaults.colors(selectedColor = colors.primary, unselectedColor = colors.line),
                )
            }
        }
    }
}

