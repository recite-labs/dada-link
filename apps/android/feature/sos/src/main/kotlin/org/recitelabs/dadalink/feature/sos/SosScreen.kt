package org.recitelabs.dadalink.feature.sos

import android.Manifest
import android.content.pm.PackageManager
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import org.recitelabs.dadalink.core.designsystem.component.DadaButton
import org.recitelabs.dadalink.core.designsystem.component.DadaButtonStyle
import org.recitelabs.dadalink.core.designsystem.component.DadaCard
import org.recitelabs.dadalink.core.designsystem.component.DadaOutlinedButton
import org.recitelabs.dadalink.core.designsystem.icon.DadaIcons
import org.recitelabs.dadalink.core.designsystem.theme.DadaTheme
import org.recitelabs.dadalink.core.domain.safety.SosMessageLabels
import org.recitelabs.dadalink.core.model.SosChannel
import org.recitelabs.dadalink.core.model.SosChannelResult
import org.recitelabs.dadalink.core.model.TrustedContact
import org.recitelabs.dadalink.core.ui.DadaScreen
import org.recitelabs.dadalink.core.ui.PhonePreviews
import org.recitelabs.dadalink.core.ui.composeSms
import org.recitelabs.dadalink.core.ui.dial
import org.recitelabs.dadalink.core.ui.shareText
import org.recitelabs.dadalink.feature.sos.navigation.SosSentRoute
import org.recitelabs.dadalink.feature.sos.navigation.toArg
import org.recitelabs.dadalink.core.ui.R as CoreUiR

private val SOS_PERMISSIONS = arrayOf(
    Manifest.permission.SEND_SMS,
    Manifest.permission.ACCESS_FINE_LOCATION,
    Manifest.permission.ACCESS_COARSE_LOCATION,
)

@Composable
internal fun SosDestination(
    onBack: () -> Unit,
    onSent: (SosSentRoute) -> Unit,
    onAddContact: () -> Unit,
    viewModel: SosViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val context = LocalContext.current
    fun granted() = SOS_PERMISSIONS.take(2).all { ContextCompat.checkSelfPermission(context, it) == PackageManager.PERMISSION_GRANTED }
    var hasPermissions by remember { mutableStateOf(granted()) }
    var asked by rememberSaveable { mutableStateOf(false) }
    var sendAfterPermission by rememberSaveable { mutableStateOf(false) }

    val message = stringResource(R.string.sos_message, state.nickname ?: stringResource(R.string.sos_message_someone))
    val labels = SosMessageLabels(
        location = stringResource(R.string.sos_label_location),
        time = stringResource(R.string.sos_label_time),
        locationUnknown = stringResource(R.string.sos_label_unknown),
    )
    val shareTitle = stringResource(CoreUiR.string.core_ui_share_with)

    val launcher = rememberLauncherForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) {
        hasPermissions = granted()
        if (sendAfterPermission) {
            sendAfterPermission = false
            viewModel.send(message, labels)
        }
    }

    LaunchedEffect(state.phase) {
        val done = state.phase as? SosPhase.Done ?: return@LaunchedEffect
        val outcome = done.outcome
        // Fallback: hand the alert to the SMS app / share sheet so the user can press send.
        var openedFallback = false
        if (outcome.needsShareFallback) {
            val phone = outcome.alert.contact.phone
            openedFallback = if (phone != null) context.composeSms(phone, outcome.alert.message) else context.shareText(outcome.alert.message, shareTitle)
        }
        onSent(
            SosSentRoute(
                contactName = outcome.alert.contact.name,
                sms = outcome.results.firstOrNull { it.channel == SosChannel.SMS }.toArg(openedFallback),
                relay = outcome.results.firstOrNull { it.channel == SosChannel.RELAY }.toArg(false),
                emergencyNumber = state.emergencyNumber,
                embassyNumber = state.embassyNumber,
            ),
        )
        viewModel.consumeResult()
    }

    SosScreen(
        state = state,
        hasPermissions = hasPermissions,
        onBack = onBack,
        onRequestPermissions = { asked = true; launcher.launch(SOS_PERMISSIONS) },
        onHoldComplete = {
            if (!hasPermissions && !asked) {
                asked = true
                sendAfterPermission = true
                launcher.launch(SOS_PERMISSIONS)
            } else {
                viewModel.send(message, labels)
            }
        },
        onCall = { context.dial(it) },
        onAddContact = onAddContact,
    )
}

/** 04 SOS: press and hold for 3 s; shows exactly what will be sent and to whom. */
@Composable
fun SosScreen(
    state: SosUiState,
    hasPermissions: Boolean,
    onBack: () -> Unit,
    onRequestPermissions: () -> Unit,
    onHoldComplete: () -> Unit,
    onCall: (String) -> Unit,
    onAddContact: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val colors = DadaTheme.colors
    DadaScreen(title = stringResource(R.string.sos_title), onBack = onBack, modifier = modifier, secure = true) {
        Column(
            modifier = Modifier
                .weight(1f)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = DadaTheme.spacing.screen),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            Text(stringResource(R.string.sos_hold_title), style = DadaTheme.typography.headline, color = colors.ink, textAlign = TextAlign.Center)
            Text(stringResource(R.string.sos_hold_body), style = DadaTheme.typography.body, color = colors.muted, textAlign = TextAlign.Center)
            val sending = state.phase == SosPhase.Sending
            HoldToSendButton(
                label = if (sending) "…" else "SOS",
                accessibilityLabel = stringResource(R.string.sos_hold_button),
                enabled = state.contact != null && !sending,
                onComplete = onHoldComplete,
                modifier = Modifier.padding(vertical = 8.dp),
            )
            if (sending) Text(stringResource(R.string.sos_sending), style = DadaTheme.typography.label, color = colors.sos)

            val contact = state.contact
            if (contact == null) {
                NoContactCard(onAddContact)
            } else {
                if (!hasPermissions) PermissionCard(onRequestPermissions)
                WhatWillBeSent(contact)
            }
        }
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .navigationBarsPadding()
                .padding(DadaTheme.spacing.screen),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            DadaButton(
                text = stringResource(R.string.sos_call_emergency, state.emergencyNumber),
                onClick = { onCall(state.emergencyNumber) },
                style = DadaButtonStyle.Danger,
                leadingIcon = DadaIcons.Call,
                modifier = Modifier.weight(1f),
            )
            state.embassyNumber?.let { embassy ->
                DadaOutlinedButton(text = stringResource(R.string.sos_call_embassy), onClick = { onCall(embassy) }, modifier = Modifier.weight(1f))
            }
        }
    }
}

@Composable
private fun WhatWillBeSent(contact: TrustedContact) {
    DadaCard(modifier = Modifier.fillMaxWidth(), shape = DadaTheme.shapes.cardLarge) {
        Text(stringResource(R.string.sos_what_sent), style = DadaTheme.typography.titleSmall, color = DadaTheme.colors.ink)
        Spacer(Modifier.height(8.dp))
        Line(DadaIcons.Person, stringResource(R.string.sos_to, contact.name, contact.relation.ifBlank { "—" }))
        contact.phone?.let { Line(DadaIcons.Sms, stringResource(R.string.sos_by_sms, it)) }
        contact.telegram?.let { Line(DadaIcons.Send, stringResource(R.string.sos_by_telegram, it)) }
        Line(DadaIcons.Location, stringResource(R.string.sos_your_location))
        Line(DadaIcons.Hours, stringResource(R.string.sos_time))
    }
}

@Composable
private fun Line(icon: ImageVector, text: String) {
    Row(Modifier.padding(vertical = 4.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
        Icon(icon, contentDescription = null, tint = DadaTheme.colors.primary, modifier = Modifier.size(20.dp))
        Text(text, style = DadaTheme.typography.bodySmall, color = DadaTheme.colors.ink)
    }
}

@Composable
private fun PermissionCard(onAllow: () -> Unit) {
    val colors = DadaTheme.colors
    DadaCard(modifier = Modifier.fillMaxWidth(), containerColor = colors.accentTint, border = BorderStroke(1.dp, colors.accent.copy(alpha = 0.4f))) {
        Text(stringResource(R.string.sos_permission_title), style = DadaTheme.typography.titleSmall, color = colors.ink)
        Text(stringResource(R.string.sos_permission_body), style = DadaTheme.typography.bodySmall, color = colors.muted)
        Spacer(Modifier.height(8.dp))
        DadaButton(text = stringResource(R.string.sos_permission_allow), onClick = onAllow, style = DadaButtonStyle.Dark)
    }
}

@Composable
private fun NoContactCard(onAdd: () -> Unit) {
    DadaCard(modifier = Modifier.fillMaxWidth(), containerColor = DadaTheme.colors.tint) {
        Text(stringResource(R.string.sos_no_contact_title), style = DadaTheme.typography.titleSmall, color = DadaTheme.colors.ink)
        Text(stringResource(R.string.sos_no_contact_body), style = DadaTheme.typography.bodySmall, color = DadaTheme.colors.muted)
        Spacer(Modifier.height(8.dp))
        DadaButton(text = stringResource(R.string.sos_add_contact), onClick = onAdd)
    }
}

@PhonePreviews
@Composable
private fun SosPreview() = DadaTheme {
    SosScreen(
        state = SosUiState(nickname = "Meron", contact = TrustedContact("Almaz", "Sister", "+251911000000", "@almaz_t"), embassyNumber = "0112345678"),
        hasPermissions = false,
        onBack = {}, onRequestPermissions = {}, onHoldComplete = {}, onCall = {}, onAddContact = {},
    )
}

internal fun SosChannelResult?.statusRes(): Int = when (this) {
    is SosChannelResult.Sent -> R.string.sos_status_sent
    is SosChannelResult.Queued -> R.string.sos_status_queued
    else -> R.string.sos_status_failed
}
