package org.recitelabs.dadalink.core.designsystem.component

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import org.recitelabs.dadalink.core.designsystem.theme.DadaTheme

/** PIN entry as N boxes; digits are never rendered, only dots. Uses the system number keyboard. */
@Composable
fun PinInputField(
    value: String,
    onValueChange: (String) -> Unit,
    contentDescription: String,
    modifier: Modifier = Modifier,
    length: Int = 4,
    isError: Boolean = false,
) {
    val colors = DadaTheme.colors
    BasicTextField(
        value = value,
        onValueChange = { next -> if (next.length <= length && next.all(Char::isDigit)) onValueChange(next) },
        modifier = modifier.semantics { this.contentDescription = contentDescription },
        singleLine = true,
        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword, imeAction = ImeAction.Done),
        decorationBox = {
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                repeat(length) { index ->
                    val filled = index < value.length
                    val focused = index == value.length
                    Box(
                        modifier = Modifier
                            .size(56.dp)
                            .background(if (filled) colors.tint else colors.surface, DadaTheme.shapes.card)
                            .border(
                                width = if (focused || isError) 2.dp else 1.dp,
                                color = when {
                                    isError -> colors.sos
                                    focused -> colors.primary
                                    else -> colors.line
                                },
                                shape = DadaTheme.shapes.card,
                            ),
                        contentAlignment = Alignment.Center,
                    ) {
                        if (filled) Box(Modifier.size(14.dp).background(colors.primaryDeep, CircleShape))
                    }
                }
            }
        },
    )
}
