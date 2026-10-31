package org.recitelabs.dadalink.feature.assistant

import android.app.Activity
import android.content.ActivityNotFoundException
import android.content.Intent
import android.speech.RecognizerIntent
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.core.os.ConfigurationCompat
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import org.recitelabs.dadalink.core.designsystem.component.DadaButton
import org.recitelabs.dadalink.core.designsystem.component.DadaButtonStyle
import org.recitelabs.dadalink.core.designsystem.component.DadaCard
import org.recitelabs.dadalink.core.designsystem.component.DadaChip
import org.recitelabs.dadalink.core.designsystem.component.DadaTextButton
import org.recitelabs.dadalink.core.designsystem.icon.DadaIcons
import org.recitelabs.dadalink.core.designsystem.theme.DadaTheme
import org.recitelabs.dadalink.core.model.ChatMessage
import org.recitelabs.dadalink.core.model.ChatRole
import org.recitelabs.dadalink.core.model.SourceRef
import org.recitelabs.dadalink.core.ui.DadaScreen
import org.recitelabs.dadalink.core.ui.PhonePreviews
import org.recitelabs.dadalink.core.ui.R as CoreUiR

@Composable
internal fun AskDestination(onBack: (() -> Unit)?, onSos: () -> Unit, viewModel: AskViewModel = hiltViewModel()) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val configuration = androidx.compose.ui.platform.LocalConfiguration.current
    val speech = rememberLauncherForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        val text = result.data?.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS)?.firstOrNull()
        if (result.resultCode == Activity.RESULT_OK && !text.isNullOrBlank()) viewModel.onAction(AskAction.Ask(text))
    }
    val startVoice = {
        val locale = ConfigurationCompat.getLocales(configuration)[0]
        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH)
            .putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            .putExtra(RecognizerIntent.EXTRA_LANGUAGE, locale?.toLanguageTag())
            .putExtra(RecognizerIntent.EXTRA_PREFER_OFFLINE, true)
        try { speech.launch(intent) } catch (_: ActivityNotFoundException) { /* no recogniser installed: typing still works */ }
    }
    LaunchedEffect(state.startVoice) {
        if (state.startVoice) {
            viewModel.onAction(AskAction.VoiceConsumed)
            startVoice()
        }
    }
    AskScreen(state = state, onAction = viewModel::onAction, onBack = onBack, onSos = onSos, onVoice = startVoice)
}

/** 02 Ask Dada. FLAG_SECURE: the conversation can't be screenshotted or seen in Recents. */
@OptIn(ExperimentalLayoutApi::class)
@Composable
fun AskScreen(
    state: AskUiState,
    onAction: (AskAction) -> Unit,
    onBack: (() -> Unit)?,
    onSos: () -> Unit,
    onVoice: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val listState = rememberLazyListState()
    LaunchedEffect(state.messages.size, state.messages.lastOrNull()?.text?.length) {
        if (state.messages.isNotEmpty()) listState.animateScrollToItem(state.messages.size)
    }
    DadaScreen(title = stringResource(R.string.assistant_title), onBack = onBack, modifier = modifier.imePadding(), secure = true) {
        LazyColumn(
            state = listState,
            modifier = Modifier.weight(1f),
            contentPadding = PaddingValues(horizontal = DadaTheme.spacing.screen, vertical = 8.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            item { AssistantBubble(stringResource(R.string.assistant_intro)) }
            if (state.showEmergency) item { EmergencyBanner(onSos) }
            items(state.messages, key = { it.id }) { message ->
                when {
                    message.role == ChatRole.USER -> UserBubble(message.text)
                    message.isError -> ErrorBubble(onRetry = { onAction(AskAction.Retry) })
                    else -> Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        AssistantBubble(message.text, streaming = message.isStreaming)
                        message.sources.forEach { SourceCard(it) }
                        if (!message.isStreaming && message == state.messages.lastOrNull() && message.followUps.isNotEmpty()) {
                            FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                message.followUps.forEach { DadaChip(text = it, onClick = { onAction(AskAction.Ask(it)) }) }
                            }
                        }
                    }
                }
            }
        }
        Text(
            stringResource(CoreUiR.string.core_ui_disclaimer),
            style = DadaTheme.typography.caption,
            color = DadaTheme.colors.muted,
            modifier = Modifier.padding(horizontal = DadaTheme.spacing.screen),
        )
        InputBar(state, onAction, onVoice)
    }
}

@Composable
private fun UserBubble(text: String) {
    Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.CenterEnd) {
        Text(
            text,
            style = DadaTheme.typography.body,
            color = DadaTheme.colors.onPrimary,
            modifier = Modifier
                .widthIn(max = 300.dp)
                .background(DadaTheme.colors.primary, RoundedCornerShape(20.dp, 20.dp, 4.dp, 20.dp))
                .padding(horizontal = 16.dp, vertical = 12.dp),
        )
    }
}

@Composable
private fun AssistantBubble(text: String, streaming: Boolean = false) {
    val typing = stringResource(R.string.assistant_typing)
    Text(
        text = if (streaming && text.isEmpty()) "…" else text + if (streaming) " ▍" else "",
        style = DadaTheme.typography.body,
        color = DadaTheme.colors.ink,
        modifier = Modifier
            .widthIn(max = 320.dp)
            .background(DadaTheme.colors.surface, RoundedCornerShape(20.dp, 20.dp, 20.dp, 4.dp))
            .padding(horizontal = 16.dp, vertical = 12.dp)
            .semantics {
                liveRegion = LiveRegionMode.Polite
                if (streaming && text.isEmpty()) contentDescription = typing
            },
    )
}

@Composable
private fun SourceCard(source: SourceRef) {
    val colors = DadaTheme.colors
    DadaCard(modifier = Modifier.widthIn(max = 320.dp), containerColor = colors.ground, border = BorderStroke(1.dp, colors.line), contentPadding = 12.dp) {
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp), verticalAlignment = Alignment.Top) {
            Icon(DadaIcons.Log, contentDescription = null, tint = colors.primary, modifier = Modifier.size(20.dp))
            Column {
                Text(stringResource(R.string.assistant_source, source.title), style = DadaTheme.typography.label, color = colors.ink)
                source.reviewedBy?.let { Text(stringResource(R.string.assistant_reviewed_by, it), style = DadaTheme.typography.caption, color = colors.safe) }
            }
        }
    }
}

@Composable
private fun ErrorBubble(onRetry: () -> Unit) {
    DadaCard(containerColor = DadaTheme.colors.accentTint, modifier = Modifier.widthIn(max = 320.dp)) {
        Text(stringResource(R.string.assistant_error), style = DadaTheme.typography.bodySmall, color = DadaTheme.colors.ink)
        DadaTextButton(stringResource(R.string.assistant_retry), onClick = onRetry)
    }
}

@Composable
private fun EmergencyBanner(onSos: () -> Unit) {
    val colors = DadaTheme.colors
    DadaCard(modifier = Modifier.fillMaxWidth(), containerColor = colors.sosTint, border = BorderStroke(1.dp, colors.sos.copy(alpha = 0.3f))) {
        Text(stringResource(R.string.assistant_emergency_title), style = DadaTheme.typography.titleSmall, color = colors.sos)
        Text(stringResource(R.string.assistant_emergency_body), style = DadaTheme.typography.bodySmall, color = colors.ink)
        Spacer(Modifier.size(8.dp))
        DadaButton(stringResource(R.string.assistant_open_sos), onClick = onSos, style = DadaButtonStyle.Danger)
    }
}

@Composable
private fun InputBar(state: AskUiState, onAction: (AskAction) -> Unit, onVoice: () -> Unit) {
    val colors = DadaTheme.colors
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .navigationBarsPadding()
            .padding(DadaTheme.spacing.screen, 8.dp, DadaTheme.spacing.screen, 12.dp)
            .background(colors.surface, DadaTheme.shapes.pill)
            .padding(start = 18.dp, end = 4.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(Modifier.weight(1f).padding(vertical = 14.dp)) {
            if (state.input.isEmpty()) Text(stringResource(R.string.assistant_input), style = DadaTheme.typography.body, color = colors.muted)
            BasicTextField(
                value = state.input,
                onValueChange = { onAction(AskAction.InputChanged(it)) },
                textStyle = DadaTheme.typography.body.copy(color = colors.ink),
                cursorBrush = SolidColor(colors.primary),
                maxLines = 4,
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Send),
                keyboardActions = KeyboardActions(onSend = { onAction(AskAction.Send) }),
                modifier = Modifier.fillMaxWidth(),
            )
        }
        if (state.input.isBlank()) {
            IconButton(onClick = onVoice) { Icon(DadaIcons.Mic, stringResource(R.string.assistant_voice), tint = colors.primary) }
        } else {
            IconButton(onClick = { onAction(AskAction.Send) }, enabled = state.canSend) {
                Icon(DadaIcons.Send, stringResource(R.string.assistant_send), tint = if (state.canSend) colors.primary else colors.muted)
            }
        }
    }
}

@PhonePreviews
@Composable
private fun AskPreview() = DadaTheme {
    AskScreen(
        state = AskUiState(
            messages = listOf(
                ChatMessage("1", ChatRole.USER, "Can my madam keep my passport?"),
                ChatMessage(
                    "2", ChatRole.ASSISTANT,
                    "No. In Saudi Arabia your employer is not allowed to keep your passport or iqama without your agreement.",
                    sources = listOf(SourceRef("Your rights in Saudi Arabia", "DadaLink content team")),
                    followUps = listOf("How do I report it?", "Call the embassy"),
                ),
            ),
        ),
        onAction = {}, onBack = {}, onSos = {}, onVoice = {},
    )
}
