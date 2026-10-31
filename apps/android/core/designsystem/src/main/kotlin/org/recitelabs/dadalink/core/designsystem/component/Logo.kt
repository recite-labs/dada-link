package org.recitelabs.dadalink.core.designsystem.component

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.em
import androidx.compose.ui.unit.sp
import org.recitelabs.dadalink.core.designsystem.R
import org.recitelabs.dadalink.core.designsystem.theme.DadaTheme
import org.recitelabs.dadalink.core.designsystem.theme.InterFontFamily

/** Two interlocking rings. Decorative: the wordmark carries the accessible name. */
@Composable
fun DadaLogoMark(modifier: Modifier = Modifier, size: Dp = 28.dp) {
    Image(
        painter = painterResource(R.drawable.ic_dada_logo),
        contentDescription = null,
        modifier = modifier.size(size),
    )
}

/** "DadaLink" wordmark: always Latin (brand), "Dada" in ink and "Link" in indigo. */
@Composable
fun DadaWordmark(modifier: Modifier = Modifier, markSize: Dp = 28.dp) {
    Row(
        modifier = modifier,
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        DadaLogoMark(size = markSize)
        Text(
            text = buildAnnotatedString {
                withStyle(SpanStyle(color = DadaTheme.colors.ink)) { append("Dada") }
                withStyle(SpanStyle(color = DadaTheme.colors.primary)) { append("Link") }
            },
            fontFamily = InterFontFamily,
            fontWeight = FontWeight.ExtraBold,
            fontSize = 19.sp,
            letterSpacing = (-0.03).em,
        )
    }
}
