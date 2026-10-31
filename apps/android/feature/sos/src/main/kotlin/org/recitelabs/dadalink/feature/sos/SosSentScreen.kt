package org.recitelabs.dadalink.feature.sos

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import org.recitelabs.dadalink.core.designsystem.component.DadaButton
import org.recitelabs.dadalink.core.designsystem.component.DadaButtonStyle
import org.recitelabs.dadalink.core.designsystem.component.DadaCard
import org.recitelabs.dadalink.core.designsystem.component.DadaOutlinedButton
import org.recitelabs.dadalink.core.designsystem.component.SectionHeader
import org.recitelabs.dadalink.core.designsystem.icon.DadaIcons
import org.recitelabs.dadalink.core.designsystem.theme.DadaTheme
import org.recitelabs.dadalink.core.ui.DadaScreen
import org.recitelabs.dadalink.core.ui.PhonePreviews
import org.recitelabs.dadalink.core.ui.dial
import org.recitelabs.dadalink.feature.sos.navigation.ChannelStatus
import org.recitelabs.dadalink.feature.sos.navigation.SosSentRoute

@Composable
internal fun SosSentDestination(args: SosSentRoute, onSendAgain: () -> Unit, onSafe: () -> Unit) {
    val context = LocalContext.current
    SosSentScreen(args = args, onCall = { context.dial(it) }, onSendAgain = onSendAgain, onSafe = onSafe)
}

/** 05 SOS sent: honest per-channel status and next steps. */
@Composable
fun SosSentScreen(args: SosSentRoute, onCall: (String) -> Unit, onSendAgain: () -> Unit, onSafe: () -> Unit, modifier: Modifier = Modifier) {
    val colors = DadaTheme.colors
    val delivered = args.sms.isPositive || args.relay.isPositive
    DadaScreen(title = stringResource(R.string.sos_title), onBack = null, modifier = modifier, secure = true) {
        Column(
            modifier = Modifier
                .weight(1f)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = DadaTheme.spacing.screen),
            verticalArrangement = Arrangement.spacedBy(14.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Box(
                Modifier.size(96.dp).background(if (delivered) colors.safeTint else colors.accentTint, CircleShape),
                contentAlignment = Alignment.Center,
            ) {
                Icon(
                    if (delivered) DadaIcons.CheckCircle else DadaIcons.Warning,
                    contentDescription = null,
                    tint = if (delivered) colors.safe else colors.accent,
                    modifier = Modifier.size(56.dp),
                )
            }
            Text(
                stringResource(if (delivered) R.string.sos_sent_title else R.string.sos_not_sent_title, args.contactName),
                style = DadaTheme.typography.headline,
                color = colors.ink,
                textAlign = TextAlign.Center,
            )
            Text(stringResource(R.string.sos_sent_body), style = DadaTheme.typography.body, color = colors.muted, textAlign = TextAlign.Center)
            DadaCard(modifier = Modifier.fillMaxWidth()) {
                StatusRow(stringResource(if (args.sms == ChannelStatus.OPENED) R.string.sos_channel_share else R.string.sos_channel_sms), args.sms)
                StatusRow(stringResource(R.string.sos_channel_relay), args.relay)
            }
            SectionHeader(stringResource(R.string.sos_next))
            DadaButton(
                text = stringResource(R.string.sos_call_emergency, args.emergencyNumber),
                onClick = { onCall(args.emergencyNumber) },
                style = DadaButtonStyle.Danger,
                leadingIcon = DadaIcons.Call,
                modifier = Modifier.fillMaxWidth(),
            )
            args.embassyNumber?.let { embassy ->
                DadaOutlinedButton(text = stringResource(R.string.sos_call_embassy), onClick = { onCall(embassy) }, modifier = Modifier.fillMaxWidth())
            }
            DadaOutlinedButton(text = stringResource(R.string.sos_send_again), onClick = onSendAgain, modifier = Modifier.fillMaxWidth())
        }
        DadaButton(
            text = stringResource(R.string.sos_safe_now),
            onClick = onSafe,
            style = DadaButtonStyle.Safe,
            modifier = Modifier.fillMaxWidth().navigationBarsPadding().padding(DadaTheme.spacing.screen),
        )
    }
}

@Composable
private fun StatusRow(channel: String, status: ChannelStatus) {
    val colors = DadaTheme.colors
    val (label, color) = when (status) {
        ChannelStatus.SENT -> R.string.sos_status_sent to colors.safe
        ChannelStatus.QUEUED -> R.string.sos_status_queued to colors.primary
        ChannelStatus.OPENED -> R.string.sos_status_opened to colors.primary
        ChannelStatus.FAILED -> R.string.sos_status_failed to colors.muted
    }
    Row(Modifier.fillMaxWidth().padding(vertical = 6.dp), verticalAlignment = Alignment.CenterVertically) {
        Text(channel, style = DadaTheme.typography.bodySmall, color = colors.ink, modifier = Modifier.weight(1f))
        Text(stringResource(label), style = DadaTheme.typography.label, color = color)
    }
}

@PhonePreviews
@Composable
private fun SosSentPreview() = DadaTheme {
    SosSentScreen(SosSentRoute("Almaz", ChannelStatus.SENT, ChannelStatus.QUEUED, "911", "0112345678"), {}, {}, {})
}
