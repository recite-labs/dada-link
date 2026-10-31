package org.recitelabs.dadalink.feature.disguise.calculator

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import org.recitelabs.dadalink.core.ui.PhonePreviews
import org.recitelabs.dadalink.feature.disguise.R

/**
 * Neutral, stock-looking calculator: deliberately NOT using DadaLink colours, logo or fonts.
 */
private object CalcColors {
    val Background = Color(0xFFF7F7F7)
    val Key = Color(0xFFFFFFFF)
    val Function = Color(0xFFE6E6E6)
    val Operator = Color(0xFFFF9500)
    val Text = Color(0xFF111111)
    val Muted = Color(0xFF777777)
}

@Composable
fun CalculatorDestination(viewModel: CalculatorViewModel = hiltViewModel()) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    CalculatorScreen(state, viewModel::press)
}

@Composable
fun CalculatorScreen(state: CalculatorState, onKey: (CalcKey) -> Unit, modifier: Modifier = Modifier) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .background(CalcColors.Background)
            .statusBarsPadding()
            .navigationBarsPadding()
            .padding(16.dp),
        verticalArrangement = Arrangement.Bottom,
    ) {
        Text(state.expression, color = CalcColors.Muted, fontSize = 24.sp, fontFamily = FontFamily.SansSerif, textAlign = TextAlign.End, modifier = Modifier.fillMaxWidth())
        Text(
            state.display,
            color = CalcColors.Text,
            fontSize = if (state.display.length > 9) 44.sp else 64.sp,
            fontWeight = FontWeight.Light,
            fontFamily = FontFamily.SansSerif,
            textAlign = TextAlign.End,
            maxLines = 1,
            modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp),
        )
        val del = stringResource(R.string.disguise_delete)
        val clear = stringResource(R.string.disguise_clear)
        val rows: List<List<Triple<String, CalcKey, String?>>> = listOf(
            listOf(Triple("C", CalcKey.Clear, clear), Triple("⌫", CalcKey.Delete, del), Triple("%", CalcKey.Percent, null), Triple("÷", CalcKey.Op(Operator.DIVIDE), null)),
            listOf(Triple("7", CalcKey.Digit(7), null), Triple("8", CalcKey.Digit(8), null), Triple("9", CalcKey.Digit(9), null), Triple("×", CalcKey.Op(Operator.MULTIPLY), null)),
            listOf(Triple("4", CalcKey.Digit(4), null), Triple("5", CalcKey.Digit(5), null), Triple("6", CalcKey.Digit(6), null), Triple("−", CalcKey.Op(Operator.SUBTRACT), null)),
            listOf(Triple("1", CalcKey.Digit(1), null), Triple("2", CalcKey.Digit(2), null), Triple("3", CalcKey.Digit(3), null), Triple("+", CalcKey.Op(Operator.ADD), null)),
            listOf(Triple("0", CalcKey.Digit(0), null), Triple(".", CalcKey.Dot, null), Triple("=", CalcKey.Equals, null)),
        )
        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            rows.forEach { row ->
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    row.forEach { (label, key, description) ->
                        val wide = key == CalcKey.Digit(0)
                        CalcButton(label, key, description, onKey, Modifier.weight(if (wide) 2f else 1f).aspectRatio(if (wide) 2.1f else 1f))
                    }
                }
            }
        }
    }
}

@Composable
private fun CalcButton(label: String, key: CalcKey, description: String?, onKey: (CalcKey) -> Unit, modifier: Modifier) {
    val (bg, fg) = when (key) {
        is CalcKey.Op, CalcKey.Equals -> CalcColors.Operator to Color.White
        CalcKey.Clear, CalcKey.Delete, CalcKey.Percent -> CalcColors.Function to CalcColors.Text
        else -> CalcColors.Key to CalcColors.Text
    }
    Surface(
        onClick = { onKey(key) },
        modifier = modifier.then(if (description != null) Modifier.semantics { contentDescription = description } else Modifier),
        shape = CircleShape,
        color = bg,
        shadowElevation = 1.dp,
    ) {
        Box(contentAlignment = Alignment.Center) {
            Text(label, color = fg, fontSize = 28.sp, fontFamily = FontFamily.SansSerif)
        }
    }
}

@PhonePreviews
@Composable
private fun CalculatorPreview() = CalculatorScreen(CalculatorState(entry = "1250", accumulator = java.math.BigDecimal(200), pending = Operator.ADD), {})
