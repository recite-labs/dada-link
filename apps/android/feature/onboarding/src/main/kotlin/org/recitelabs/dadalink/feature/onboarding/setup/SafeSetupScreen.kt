package org.recitelabs.dadalink.feature.onboarding.setup

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import org.recitelabs.dadalink.core.designsystem.component.DadaButton
import org.recitelabs.dadalink.core.designsystem.component.DadaCard
import org.recitelabs.dadalink.core.designsystem.component.DadaChoiceCard
import org.recitelabs.dadalink.core.designsystem.component.DadaSwitchRow
import org.recitelabs.dadalink.core.designsystem.component.DadaTextField
import org.recitelabs.dadalink.core.designsystem.component.PinInputField
import org.recitelabs.dadalink.core.designsystem.icon.DadaIcons
import org.recitelabs.dadalink.core.designsystem.theme.DadaTheme
import org.recitelabs.dadalink.core.domain.safety.PinPolicy
import org.recitelabs.dadalink.core.domain.safety.TrustedContactValidator.Problem
import org.recitelabs.dadalink.core.model.DisguiseMode
import org.recitelabs.dadalink.core.ui.DadaScreen
import org.recitelabs.dadalink.core.ui.PhonePreviews
import org.recitelabs.dadalink.feature.onboarding.R

@Composable
internal fun SafeSetupDestination(
    onBack: () -> Unit,
    onComplete: () -> Unit,
    viewModel: SafeSetupViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    LaunchedEffect(state.isComplete) { if (state.isComplete) onComplete() }
    SafeSetupScreen(state = state, onAction = viewModel::onAction, onBack = onBack)
}

/** 00b Safe setup: PIN, disguise, trusted contact, notification privacy. */
@Composable
fun SafeSetupScreen(
    state: SafeSetupUiState,
    onAction: (SafeSetupAction) -> Unit,
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
) {
    DadaScreen(title = stringResource(R.string.onboarding_setup_title), onBack = onBack, modifier = modifier, secure = true) {
        Column(
            modifier = Modifier
                .weight(1f)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = DadaTheme.spacing.screen),
            verticalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            Text(stringResource(R.string.onboarding_setup_intro), style = DadaTheme.typography.body, color = DadaTheme.colors.muted)
            DadaTextField(
                value = state.nickname,
                onValueChange = { onAction(SafeSetupAction.NicknameChanged(it)) },
                label = stringResource(R.string.onboarding_nickname),
                placeholder = stringResource(R.string.onboarding_nickname_hint),
            )

            Section(title = stringResource(R.string.onboarding_pin_title), body = stringResource(R.string.onboarding_pin_body)) {
                PinInputField(
                    value = state.pin,
                    onValueChange = { onAction(SafeSetupAction.PinChanged(it)) },
                    contentDescription = stringResource(R.string.onboarding_pin_description),
                    isError = state.pinError != null,
                )
                state.pinError?.let { ErrorText(stringResource(it.messageRes())) }
            }

            Section(title = stringResource(R.string.onboarding_disguise_title)) {
                DisguiseOptions(selected = state.disguise, onSelect = { onAction(SafeSetupAction.DisguiseChanged(it)) })
            }

            Section(title = stringResource(R.string.onboarding_contact_title), body = stringResource(R.string.onboarding_contact_body)) {
                TrustedContactFields(
                    ContactForm(
                        name = state.contactName,
                        relation = state.contactRelation,
                        phone = state.contactPhone,
                        telegram = state.contactTelegram,
                        problems = state.contactProblems,
                        onName = { onAction(SafeSetupAction.ContactNameChanged(it)) },
                        onRelation = { onAction(SafeSetupAction.ContactRelationChanged(it)) },
                        onPhone = { onAction(SafeSetupAction.ContactPhoneChanged(it)) },
                        onTelegram = { onAction(SafeSetupAction.ContactTelegramChanged(it)) },
                    ),
                )
            }

            DadaSwitchRow(
                title = stringResource(R.string.onboarding_hide_notifications),
                subtitle = stringResource(R.string.onboarding_hide_notifications_body),
                checked = state.hideNotificationContent,
                onCheckedChange = { onAction(SafeSetupAction.HideNotificationsChanged(it)) },
            )
            Spacer(Modifier.height(8.dp))
        }
        DadaButton(
            text = stringResource(R.string.onboarding_finish),
            onClick = { onAction(SafeSetupAction.Submit) },
            enabled = !state.isSaving && state.pin.length == PinPolicy.LENGTH,
            modifier = Modifier
                .fillMaxWidth()
                .navigationBarsPadding()
                .imePadding()
                .padding(DadaTheme.spacing.screen),
        )
    }
}

@Composable
internal fun DisguiseOptions(selected: DisguiseMode, onSelect: (DisguiseMode) -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        DadaChoiceCard(
            title = stringResource(R.string.onboarding_disguise_calculator),
            subtitle = stringResource(R.string.onboarding_disguise_calculator_body),
            icon = DadaIcons.Lock,
            selected = selected == DisguiseMode.CALCULATOR,
            onClick = { onSelect(DisguiseMode.CALCULATOR) },
        )
        DadaChoiceCard(
            title = stringResource(R.string.onboarding_disguise_notes),
            subtitle = stringResource(R.string.onboarding_disguise_notes_body),
            icon = DadaIcons.Log,
            selected = selected == DisguiseMode.NOTES,
            onClick = { onSelect(DisguiseMode.NOTES) },
        )
        DadaChoiceCard(
            title = stringResource(R.string.onboarding_disguise_none),
            subtitle = stringResource(R.string.onboarding_disguise_none_body),
            icon = DadaIcons.Shield,
            selected = selected == DisguiseMode.NONE,
            onClick = { onSelect(DisguiseMode.NONE) },
        )
    }
}

/** Values + callbacks for the trusted-contact form, shared by setup and settings. */
internal class ContactForm(
    val name: String,
    val relation: String,
    val phone: String,
    val telegram: String,
    val problems: Set<Problem>,
    val onName: (String) -> Unit,
    val onRelation: (String) -> Unit,
    val onPhone: (String) -> Unit,
    val onTelegram: (String) -> Unit,
)

@Composable
internal fun TrustedContactFields(form: ContactForm) {
    val problems = form.problems
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        DadaTextField(
            value = form.name,
            onValueChange = form.onName,
            label = stringResource(R.string.onboarding_contact_name),
            isError = Problem.NAME_MISSING in problems,
            supportingText = if (Problem.NAME_MISSING in problems) stringResource(R.string.onboarding_contact_error_name) else null,
        )
        DadaTextField(value = form.relation, onValueChange = form.onRelation, label = stringResource(R.string.onboarding_contact_relation))
        DadaTextField(
            value = form.phone,
            onValueChange = form.onPhone,
            label = stringResource(R.string.onboarding_contact_phone),
            placeholder = "+251 …",
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
            isError = Problem.PHONE_INVALID in problems || Problem.NO_CHANNEL in problems,
            supportingText = when {
                Problem.PHONE_INVALID in problems -> stringResource(R.string.onboarding_contact_error_phone)
                Problem.NO_CHANNEL in problems -> stringResource(R.string.onboarding_contact_error_channel)
                else -> null
            },
        )
        DadaTextField(
            value = form.telegram,
            onValueChange = form.onTelegram,
            label = stringResource(R.string.onboarding_contact_telegram),
            placeholder = "@",
            isError = Problem.TELEGRAM_INVALID in problems,
            supportingText = if (Problem.TELEGRAM_INVALID in problems) stringResource(R.string.onboarding_contact_error_telegram) else null,
        )
    }
}

@Composable
internal fun Section(title: String, body: String? = null, content: @Composable ColumnScope.() -> Unit) {
    DadaCard(modifier = Modifier.fillMaxWidth(), shape = DadaTheme.shapes.cardLarge) {
        Text(title, style = DadaTheme.typography.titleSmall, color = DadaTheme.colors.ink)
        if (body != null) Text(body, style = DadaTheme.typography.bodySmall, color = DadaTheme.colors.muted)
        Spacer(Modifier.height(12.dp))
        content()
    }
}

@Composable
private fun ErrorText(text: String) {
    Text(text, style = DadaTheme.typography.caption, color = DadaTheme.colors.sos, modifier = Modifier.padding(top = 6.dp))
}

private fun PinPolicy.Verdict.messageRes(): Int = when (this) {
    PinPolicy.Verdict.TOO_SIMPLE -> R.string.onboarding_pin_error_simple
    else -> R.string.onboarding_pin_error_length
}

@PhonePreviews
@Composable
private fun SafeSetupPreview() = DadaTheme {
    SafeSetupScreen(
        SafeSetupUiState(nickname = "Meron", pin = "20", contactName = "Almaz", contactRelation = "Sister", contactPhone = "+251 91 100 0000"),
        {},
        {},
    )
}
