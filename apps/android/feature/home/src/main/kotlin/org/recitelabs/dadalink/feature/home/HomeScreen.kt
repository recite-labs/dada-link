package org.recitelabs.dadalink.feature.home

import android.text.format.DateUtils
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import org.recitelabs.dadalink.core.designsystem.component.ChipTone
import org.recitelabs.dadalink.core.designsystem.component.DadaButton
import org.recitelabs.dadalink.core.designsystem.component.DadaButtonStyle
import org.recitelabs.dadalink.core.designsystem.component.DadaCard
import org.recitelabs.dadalink.core.designsystem.component.DadaChip
import org.recitelabs.dadalink.core.designsystem.component.DadaListRow
import org.recitelabs.dadalink.core.designsystem.component.DadaPill
import org.recitelabs.dadalink.core.designsystem.component.DadaTile
import org.recitelabs.dadalink.core.designsystem.component.DadaWordmark
import org.recitelabs.dadalink.core.designsystem.icon.DadaIcons
import org.recitelabs.dadalink.core.designsystem.theme.DadaTheme
import org.recitelabs.dadalink.core.model.AppLanguage
import org.recitelabs.dadalink.core.model.Country
import org.recitelabs.dadalink.core.model.Mood
import org.recitelabs.dadalink.core.model.TrustedContact
import org.recitelabs.dadalink.core.ui.HideButton
import org.recitelabs.dadalink.core.ui.PhonePreviews
import org.recitelabs.dadalink.core.ui.composeSms
import org.recitelabs.dadalink.core.ui.localizedName
import org.recitelabs.dadalink.core.ui.shareText
import java.time.Instant

/** Where Home can take the user; the app module maps these to routes. */
enum class HomeTarget { HELP, LOG, HEALTH, RIGHTS, SETTINGS }

@Composable
internal fun HomeDestination(
    onAsk: (question: String?, voice: Boolean) -> Unit,
    onOpen: (HomeTarget) -> Unit,
    viewModel: HomeViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val checkInTemplate = stringResource(R.string.home_check_in_message, state.contact?.name.orEmpty())
    val shareTitle = stringResource(org.recitelabs.dadalink.core.ui.R.string.core_ui_share_with)
    HomeScreen(
        state = state,
        onMood = { mood ->
            viewModel.selectMood(mood)
            if (mood == Mood.NOT_SAFE) onOpen(HomeTarget.HELP)
        },
        onAsk = onAsk,
        onOpen = onOpen,
        onLanguage = viewModel::setLanguage,
        onCheckIn = {
            val contact = state.contact ?: return@HomeScreen onOpen(HomeTarget.SETTINGS)
            val phone = contact.phone
            val opened = if (phone != null) context.composeSms(phone, checkInTemplate) else context.shareText(checkInTemplate, shareTitle)
            if (opened) viewModel.onCheckedIn()
        },
    )
}

/** 01 Home (abroad). */
@OptIn(ExperimentalLayoutApi::class)
@Composable
fun HomeScreen(
    state: HomeUiState,
    onMood: (Mood) -> Unit,
    onAsk: (question: String?, voice: Boolean) -> Unit,
    onOpen: (HomeTarget) -> Unit,
    onLanguage: (AppLanguage) -> Unit,
    onCheckIn: () -> Unit,
    modifier: Modifier = Modifier,
    now: Instant = Instant.now(),
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .background(DadaTheme.colors.ground)
            .statusBarsPadding()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = DadaTheme.spacing.screen),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        Header(language = state.language, onLanguage = onLanguage)
        LocationLine(state.country)
        Text(
            text = state.nickname?.let { stringResource(R.string.home_greeting_named, it) } ?: stringResource(R.string.home_greeting),
            style = DadaTheme.typography.display,
            color = DadaTheme.colors.ink,
        )
        FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            MoodChip(R.string.home_mood_good, Mood.GOOD, state.mood, onMood)
            MoodChip(R.string.home_mood_tired, Mood.TIRED, state.mood, onMood)
            MoodChip(R.string.home_mood_low, Mood.LOW, state.mood, onMood)
            MoodChip(R.string.home_mood_not_safe, Mood.NOT_SAFE, state.mood, onMood, ChipTone.Danger)
        }
        MoodFeedback(state.mood, onAsk)
        AskDadaCard(onAsk = onAsk)
        Tiles(onOpen)
        ContactRow(state.contact, state.lastCheckIn, now, onCheckIn, onAddContact = { onOpen(HomeTarget.SETTINGS) })
        Spacer(Modifier.height(16.dp))
    }
}

@Composable
private fun Header(language: AppLanguage, onLanguage: (AppLanguage) -> Unit) {
    var menu by remember { mutableStateOf(false) }
    Row(modifier = Modifier.fillMaxWidth().padding(top = 8.dp), verticalAlignment = Alignment.CenterVertically) {
        DadaWordmark(modifier = Modifier.weight(1f))
        Box {
            DadaPill(
                text = language.endonym,
                onClick = { menu = true },
                leadingIcon = DadaIcons.Language,
                modifier = Modifier.padding(end = 8.dp),
            )
            DropdownMenu(expanded = menu, onDismissRequest = { menu = false }) {
                AppLanguage.entries.filter { it.isAvailable }.forEach { option ->
                    DropdownMenuItem(text = { Text(option.endonym) }, onClick = { menu = false; onLanguage(option) })
                }
            }
        }
        HideButton()
    }
}

@Composable
private fun LocationLine(country: Country) {
    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
        Icon(DadaIcons.Location, contentDescription = null, tint = DadaTheme.colors.primary, modifier = Modifier.size(18.dp))
        Text(stringResource(R.string.home_location, country.localizedName()), style = DadaTheme.typography.caption, color = DadaTheme.colors.muted)
    }
}

@Composable
private fun MoodChip(label: Int, mood: Mood, selected: Mood?, onMood: (Mood) -> Unit, tone: ChipTone = ChipTone.Neutral) {
    DadaChip(text = stringResource(label), selected = selected == mood, tone = tone, onClick = { onMood(mood) })
}

@Composable
private fun MoodFeedback(mood: Mood?, onAsk: (String?, Boolean) -> Unit) {
    when (mood) {
        Mood.GOOD, Mood.TIRED -> Text(stringResource(R.string.home_mood_thanks), style = DadaTheme.typography.bodySmall, color = DadaTheme.colors.muted)
        Mood.LOW -> {
            val question = stringResource(R.string.home_mood_low_question)
            DadaCard(onClick = { onAsk(question, false) }, containerColor = DadaTheme.colors.tint, modifier = Modifier.fillMaxWidth()) {
                Text(stringResource(R.string.home_mood_low_hint), style = DadaTheme.typography.label, color = DadaTheme.colors.primaryDeep)
            }
        }
        else -> Unit
    }
}

@Composable
private fun AskDadaCard(onAsk: (String?, Boolean) -> Unit) {
    var question by rememberSaveable { mutableStateOf("") }
    val colors = DadaTheme.colors
    DadaCard(
        modifier = Modifier.fillMaxWidth(),
        containerColor = colors.primaryDeep,
        contentColor = colors.onPrimary,
        shape = DadaTheme.shapes.cardLarge,
        contentPadding = 20.dp,
    ) {
        Text(stringResource(R.string.home_ask_title), style = DadaTheme.typography.title, color = colors.onPrimary)
        Text(stringResource(R.string.home_ask_body), style = DadaTheme.typography.bodySmall, color = colors.onPrimary.copy(alpha = 0.8f))
        Spacer(Modifier.height(14.dp))
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(colors.ground, DadaTheme.shapes.pill)
                .padding(start = 18.dp, end = 4.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Box(Modifier.weight(1f).padding(vertical = 14.dp)) {
                if (question.isEmpty()) {
                    Text(stringResource(R.string.home_ask_placeholder), style = DadaTheme.typography.body, color = colors.muted)
                }
                BasicTextField(
                    value = question,
                    onValueChange = { question = it },
                    textStyle = DadaTheme.typography.body.copy(color = colors.ink),
                    cursorBrush = SolidColor(colors.primary),
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(imeAction = ImeAction.Send),
                    keyboardActions = KeyboardActions(onSend = { if (question.isNotBlank()) onAsk(question, false).also { question = "" } }),
                    modifier = Modifier.fillMaxWidth(),
                )
            }
            if (question.isBlank()) {
                IconButton(onClick = { onAsk(null, true) }) {
                    Icon(DadaIcons.Mic, contentDescription = stringResource(R.string.home_ask_voice), tint = colors.primary)
                }
            } else {
                IconButton(onClick = { onAsk(question, false); question = "" }) {
                    Icon(DadaIcons.Send, contentDescription = stringResource(R.string.home_ask_send), tint = colors.primary)
                }
            }
        }
    }
}

@Composable
private fun Tiles(onOpen: (HomeTarget) -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            DadaTile(stringResource(R.string.home_tile_help), stringResource(R.string.home_tile_help_body), DadaIcons.Help, { onOpen(HomeTarget.HELP) }, Modifier.weight(1f))
            DadaTile(stringResource(R.string.home_tile_log), stringResource(R.string.home_tile_log_body), DadaIcons.Lock, { onOpen(HomeTarget.LOG) }, Modifier.weight(1f))
        }
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            DadaTile(stringResource(R.string.home_tile_health), stringResource(R.string.home_tile_health_body), DadaIcons.Health, { onOpen(HomeTarget.HEALTH) }, Modifier.weight(1f))
            DadaTile(stringResource(R.string.home_tile_rights), stringResource(R.string.home_tile_rights_body), DadaIcons.Rights, { onOpen(HomeTarget.RIGHTS) }, Modifier.weight(1f))
        }
    }
}

@Composable
private fun ContactRow(contact: TrustedContact?, lastCheckIn: Instant?, now: Instant, onCheckIn: () -> Unit, onAddContact: () -> Unit) {
    if (contact == null) {
        DadaListRow(
            title = stringResource(R.string.home_add_contact),
            subtitle = stringResource(R.string.home_add_contact_body),
            icon = DadaIcons.Person,
            onClick = onAddContact,
        )
        return
    }
    val colors = DadaTheme.colors
    DadaCard(modifier = Modifier.fillMaxWidth(), containerColor = colors.safeTint, border = BorderStroke(1.dp, colors.safe.copy(alpha = 0.2f))) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Box(Modifier.size(40.dp).background(colors.safe, CircleShape), contentAlignment = Alignment.Center) {
                Text(contact.name.take(1).uppercase(), style = DadaTheme.typography.titleSmall, color = colors.onPrimary)
            }
            Column(Modifier.weight(1f)) {
                Text(
                    if (lastCheckIn != null) stringResource(R.string.home_contact_ok, contact.name) else stringResource(R.string.home_contact_never, contact.name),
                    style = DadaTheme.typography.titleSmall,
                    color = colors.ink,
                )
                if (lastCheckIn != null) {
                    val ago = DateUtils.getRelativeTimeSpanString(lastCheckIn.toEpochMilli(), now.toEpochMilli(), DateUtils.MINUTE_IN_MILLIS).toString()
                    Text(stringResource(R.string.home_contact_last, ago), style = DadaTheme.typography.caption, color = colors.muted)
                }
            }
            DadaButton(text = stringResource(R.string.home_check_in), onClick = onCheckIn, style = DadaButtonStyle.Safe)
        }
    }
}

@PhonePreviews
@Composable
private fun HomePreview() = DadaTheme {
    HomeScreen(
        state = HomeUiState(
            nickname = "Meron",
            contact = TrustedContact("Almaz", "Sister", "+251911000000", null),
            lastCheckIn = Instant.parse("2026-10-29T10:00:00Z"),
        ),
        onMood = {}, onAsk = { _, _ -> }, onOpen = {}, onLanguage = {}, onCheckIn = {},
        now = Instant.parse("2026-10-31T10:00:00Z"),
    )
}
