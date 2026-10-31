package org.recitelabs.dadalink.feature.sos

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.onClick
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch
import org.recitelabs.dadalink.core.designsystem.theme.DadaTheme

/**
 * Press-and-hold SOS: a ring fills over [holdMillis]; releasing early cancels. Prevents pocket
 * triggers. Screen-reader users activate it with a double tap (an explicit, deliberate gesture).
 */
@Composable
fun HoldToSendButton(
    label: String,
    accessibilityLabel: String,
    enabled: Boolean,
    onComplete: () -> Unit,
    modifier: Modifier = Modifier,
    size: Dp = 220.dp,
    holdMillis: Int = 3_000,
) {
    val progress = remember { Animatable(0f) }
    val scope = rememberCoroutineScope()
    val haptics = LocalHapticFeedback.current
    val colors = DadaTheme.colors
    Box(
        modifier = modifier
            .size(size)
            .semantics {
                role = Role.Button
                contentDescription = accessibilityLabel
                onClick { if (enabled) onComplete(); enabled }
            }
            .pointerInput(enabled) {
                if (!enabled) return@pointerInput
                detectTapGestures(onPress = {
                    haptics.performHapticFeedback(HapticFeedbackType.LongPress)
                    val job = scope.launch {
                        progress.animateTo(1f, tween(durationMillis = (holdMillis * (1f - progress.value)).toInt(), easing = LinearEasing))
                        haptics.performHapticFeedback(HapticFeedbackType.LongPress)
                        onComplete()
                    }
                    tryAwaitRelease()
                    if (progress.value < 1f) {
                        job.cancel()
                        scope.launch { progress.animateTo(0f, tween(200)) }
                    } else {
                        scope.launch { progress.snapTo(0f) }
                    }
                })
            },
        contentAlignment = Alignment.Center,
    ) {
        Canvas(Modifier.fillMaxSize()) {
            val stroke = 14.dp.toPx()
            val inset = stroke / 2
            val arcSize = Size(this.size.width - stroke, this.size.height - stroke)
            drawArc(colors.sosTint, 0f, 360f, false, Offset(inset, inset), arcSize, style = Stroke(stroke))
            drawArc(colors.sos, -90f, 360f * progress.value, false, Offset(inset, inset), arcSize, style = Stroke(stroke, cap = StrokeCap.Round))
        }
        Box(
            Modifier
                .padding(24.dp)
                .fillMaxSize()
                .background(if (enabled) colors.sos else colors.line, CircleShape),
            contentAlignment = Alignment.Center,
        ) {
            Text(label, color = colors.onSos, fontSize = 44.sp, fontWeight = FontWeight.ExtraBold, style = DadaTheme.typography.display)
        }
    }
}
