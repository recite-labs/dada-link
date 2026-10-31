package org.recitelabs.dadalink.feature.onboarding.settings

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import org.recitelabs.dadalink.core.designsystem.component.DadaButton
import org.recitelabs.dadalink.core.designsystem.component.DadaChoiceCard
import org.recitelabs.dadalink.core.designsystem.component.DadaSwitchRow
import org.recitelabs.dadalink.core.designsystem.theme.DadaTheme
import org.recitelabs.dadalink.core.designsystem.theme.NotoSansEthiopicFontFamily
import org.recitelabs.dadalink.core.model.AppLanguage
import org.recitelabs.dadalink.core.model.DisguiseMode
import org.recitelabs.dadalink.core.ui.DadaScreen
import org.recitelabs.dadalink.core.ui.PhonePreviews
import org.recitelabs.dadalink.feature.onboarding.R
import org.recitelabs.dadalink.feature.onboarding.setup.ContactForm
import org.recitelabs.dadalink.feature.onboarding.setup.DisguiseOptions
import org.recitelabs.dadalink.feature.onboarding.setup.Section
import org.recitelabs.dadalink.feature.onboarding.setup.TrustedContactFields
import org.recitelabs.dadalink.core.ui.R as CoreUiR

@Composable
internal fun SafetySettingsDestination(onBack: () -> Unit, viewModel: SafetySettingsViewModel = hiltViewModel()) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    SafetySettingsScreen(
        state = state,
        onBack = onBack,
        onLanguage = viewModel::setLanguage,
        onDisguise = viewModel::setDisguise,
        onHideNotifications = viewModel::setHideNotifications,
        contactForm = ContactForm(
            name = state.contactName,
            relation = state.contactRelation,
            phone = state.contactPhone,
            telegram = state.contactTelegram,
            problems = state.contactProblems,
            onName = { v -> viewModel.editContact { it.copy(contactName = v) } },
            onRelation = { v -> viewModel.editContact { it.copy(contactRelation = v) } },
            onPhone = { v -> viewModel.editContact { it.copy(contactPhone = v) } },
            onTelegram = { v -> viewModel.editContact { it.copy(contactTelegram = v) } },
        ),
        onSaveContact = viewModel::saveContact,
    )
}

@Composable
internal fun SafetySettingsScreen(
    state: SafetySettingsUiState,
    onBack: () -> Unit,
    onLanguage: (AppLanguage) -> Unit,
    onDisguise: (DisguiseMode) -> Unit,
    onHideNotifications: (Boolean) -> Unit,
    contactForm: ContactForm,
    onSaveContact: () -> Unit,
    modifier: Modifier = Modifier,
) {
    DadaScreen(title = stringResource(R.string.onboarding_settings_title), onBack = onBack, modifier = modifier, secure = true) {
        Column(
            Modifier.verticalScroll(rememberScrollState()).padding(horizontal = DadaTheme.spacing.screen),
            verticalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            Section(title = stringResource(R.string.onboarding_contact_title), body = stringResource(R.string.onboarding_contact_body)) {
                TrustedContactFields(contactForm)
                Spacer(Modifier.height(8.dp))
                DadaButton(stringResource(CoreUiR.string.core_ui_save), onClick = onSaveContact)
                if (state.contactSaved) Text(stringResource(R.string.onboarding_settings_saved), style = DadaTheme.typography.caption, color = DadaTheme.colors.safe)
            }
            Section(title = stringResource(R.string.onboarding_disguise_title)) {
                DisguiseOptions(selected = state.disguise, onSelect = onDisguise)
            }
            Section(title = stringResource(R.string.onboarding_language)) {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    AppLanguage.entries.filter { it.isAvailable }.forEach { lang ->
                        DadaChoiceCard(
                            title = lang.endonym,
                            selected = lang == state.language,
                            onClick = { onLanguage(lang) },
                            titleFontFamily = if (lang.isEthiopicScript) NotoSansEthiopicFontFamily else null,
                        )
                    }
                }
            }
            DadaSwitchRow(
                title = stringResource(R.string.onboarding_hide_notifications),
                subtitle = stringResource(R.string.onboarding_hide_notifications_body),
                checked = state.hideNotificationContent,
                onCheckedChange = onHideNotifications,
            )
            Spacer(Modifier.height(24.dp))
        }
    }
}

@PhonePreviews
@Composable
private fun SettingsPreview() = DadaTheme {
    SafetySettingsScreen(
        SafetySettingsUiState(disguise = DisguiseMode.CALCULATOR, contactName = "Almaz", contactPhone = "+251911000000"),
        {}, {}, {}, {},
        ContactForm("Almaz", "Sister", "+251911000000", "", emptySet(), {}, {}, {}, {}),
        {},
    )
}
