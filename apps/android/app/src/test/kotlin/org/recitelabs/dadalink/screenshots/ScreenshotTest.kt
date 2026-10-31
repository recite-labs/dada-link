package org.recitelabs.dadalink.screenshots

import androidx.compose.runtime.Composable
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onRoot
import com.github.takahirom.roborazzi.captureRoboImage
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.recitelabs.dadalink.core.designsystem.theme.DadaTheme
import org.recitelabs.dadalink.core.designsystem.theme.Script
import org.recitelabs.dadalink.core.model.AppLanguage
import org.recitelabs.dadalink.core.model.Article
import org.recitelabs.dadalink.core.model.ArticleCategory
import org.recitelabs.dadalink.core.model.ChatMessage
import org.recitelabs.dadalink.core.model.ChatRole
import org.recitelabs.dadalink.core.model.Country
import org.recitelabs.dadalink.core.model.LogEntry
import org.recitelabs.dadalink.core.model.Mood
import org.recitelabs.dadalink.core.model.SourceRef
import org.recitelabs.dadalink.core.model.WagesSummary
import org.recitelabs.dadalink.core.testing.TestData
import org.recitelabs.dadalink.feature.assistant.AskScreen
import org.recitelabs.dadalink.feature.assistant.AskUiState
import org.recitelabs.dadalink.feature.disguise.calculator.CalculatorScreen
import org.recitelabs.dadalink.feature.disguise.calculator.CalculatorState
import org.recitelabs.dadalink.feature.disguise.calculator.Operator
import org.recitelabs.dadalink.feature.disguise.unlock.PinUnlockScreen
import org.recitelabs.dadalink.feature.disguise.unlock.PinUnlockUiState
import org.recitelabs.dadalink.feature.health.HealthScreen
import org.recitelabs.dadalink.feature.help.HelpScreen
import org.recitelabs.dadalink.feature.help.HelpUiState
import org.recitelabs.dadalink.feature.home.HomeScreen
import org.recitelabs.dadalink.feature.home.HomeUiState
import org.recitelabs.dadalink.feature.journey.agency.AgencyCheckScreen
import org.recitelabs.dadalink.feature.journey.agency.AgencyCheckUiState
import org.recitelabs.dadalink.feature.journey.articles.ArticlesScreen
import org.recitelabs.dadalink.feature.journey.articles.ArticlesUiState
import org.recitelabs.dadalink.feature.log.list.LogScreen
import org.recitelabs.dadalink.feature.log.list.LogUiState
import org.recitelabs.dadalink.feature.onboarding.setup.SafeSetupScreen
import org.recitelabs.dadalink.feature.onboarding.setup.SafeSetupUiState
import org.recitelabs.dadalink.feature.onboarding.welcome.WelcomeScreen
import org.recitelabs.dadalink.feature.onboarding.welcome.WelcomeUiState
import org.recitelabs.dadalink.feature.sos.SosScreen
import org.recitelabs.dadalink.feature.sos.SosSentScreen
import org.recitelabs.dadalink.feature.sos.SosUiState
import org.recitelabs.dadalink.feature.sos.navigation.ChannelStatus
import org.recitelabs.dadalink.feature.sos.navigation.SosSentRoute
import org.recitelabs.dadalink.ui.more.MoreScreen
import org.robolectric.RobolectricTestRunner
import org.robolectric.RuntimeEnvironment
import org.robolectric.annotation.Config
import org.robolectric.annotation.GraphicsMode
import java.io.File
import java.time.Instant
import java.time.LocalDate

/**
 * Renders key screens with sample data (Meron in Riyadh, her sister Almaz) to
 * apps/android/docs/screenshots. Record with `./gradlew :app:recordRoborazziDebug`;
 * during a plain `test` run the captures are skipped.
 */
@RunWith(RobolectricTestRunner::class)
@GraphicsMode(GraphicsMode.Mode.NATIVE)
@Config(qualifiers = "w360dp-h800dp-xhdpi")
class ScreenshotTest {
    @get:Rule val compose = createComposeRule()

    private fun snap(name: String, script: Script = Script.Latin, content: @Composable () -> Unit) {
        compose.setContent { DadaTheme(script = script) { content() } }
        val dir = File(System.getProperty("user.dir"), "../docs/screenshots").canonicalFile
        compose.onRoot().captureRoboImage(File(dir, "$name.png").path)
    }

    @Test fun welcome() = snap("00_welcome") { WelcomeScreen(WelcomeUiState(selected = AppLanguage.AMHARIC), {}, {}) }

    @Test fun safeSetup() = snap("00b_safe_setup") {
        SafeSetupScreen(SafeSetupUiState(nickname = "Meron", pin = "20", contactName = "Almaz", contactRelation = "Sister", contactPhone = "+251 91 100 0000"), {}, {})
    }

    @Test fun home() = snap("01_home") {
        HomeScreen(
            HomeUiState(nickname = "Meron", contact = TestData.almaz, lastCheckIn = Instant.parse("2026-10-29T10:00:00Z"), mood = Mood.TIRED),
            {}, { _, _ -> }, {}, {}, {},
            now = Instant.parse("2026-10-31T10:00:00Z"),
        )
    }

    @Test fun homeAmharic() {
        RuntimeEnvironment.setQualifiers("+am")
        snap("01_home_am", Script.Ethiopic) {
            HomeScreen(HomeUiState(nickname = "መሮን", language = AppLanguage.AMHARIC, contact = TestData.almaz.copy(name = "አልማዝ")), {}, { _, _ -> }, {}, {}, {})
        }
    }

    @Test fun ask() = snap("02_ask_dada") {
        AskScreen(
            AskUiState(
                messages = listOf(
                    ChatMessage("1", ChatRole.USER, "Can my madam keep my passport?"),
                    ChatMessage(
                        "2", ChatRole.ASSISTANT,
                        "No. In Saudi Arabia your employer is not allowed to keep your passport or iqama without your agreement. " +
                            "Write down the date it was taken in your private log.",
                        sources = listOf(SourceRef("Your rights in Saudi Arabia (draft)", "DadaLink content team")),
                        followUps = listOf("How do I report it?", "Call the embassy"),
                    ),
                ),
            ),
            {}, {}, {}, {},
        )
    }

    @Test fun help() = snap("03_help_numbers") {
        HelpScreen(
            HelpUiState.Ready(Country.SAUDI_ARABIA, listOf(Country.SAUDI_ARABIA, Country.UAE, Country.KUWAIT, Country.LEBANON), TestData.saudiDirectory),
            null, {}, {}, {},
        )
    }

    @Test fun sos() = snap("04_sos") {
        SosScreen(SosUiState(nickname = "Meron", contact = TestData.almaz, embassyNumber = null), hasPermissions = true, {}, {}, {}, {}, {})
    }

    @Test fun sosSent() = snap("05_sos_sent") {
        SosSentScreen(SosSentRoute("Almaz", ChannelStatus.SENT, ChannelStatus.QUEUED, "911"), {}, {}, {})
    }

    @Test fun log() = snap("06_private_log") {
        val entries = listOf(
            LogEntry.Incident(3, LocalDate.of(2026, 10, 20), "Madam took my phone for two days.", listOf("a")),
            LogEntry.Hours(2, LocalDate.of(2026, 10, 18), "", 16.0, false),
            LogEntry.Wage(1, LocalDate.of(2026, 9, 30), "September salary", 1000, 0, "SAR"),
            LogEntry.Wage(4, LocalDate.of(2026, 8, 31), "August salary", 1000, 400, "SAR"),
        )
        LogScreen(LogUiState.Ready(entries, WagesSummary(mapOf("SAR" to 1600L), 2)), {}, {}, {}, {})
    }

    @Test fun calculator() = snap("07_disguise_calculator") {
        CalculatorScreen(CalculatorState(entry = "1250", accumulator = java.math.BigDecimal(200), pending = Operator.ADD), {})
    }

    @Test fun pinUnlock() = snap("07b_pin_unlock") { PinUnlockScreen(PinUnlockUiState(entered = "20"), {}, {}) }

    @Test fun agency() = snap("08_agency_check") {
        AgencyCheckScreen(AgencyCheckUiState(query = "Selam Foreign Employment", result = org.recitelabs.dadalink.core.model.AgencyCheckResult.NotFound), {}, {}, {}, {})
    }

    @Test fun rights() = snap("09_contract_rights") {
        ArticlesScreen(
            ArticlesUiState(
                category = ArticleCategory.RIGHTS,
                articles = listOf(
                    Article("a", ArticleCategory.RIGHTS, null, "Your passport is yours", "Your employer is not allowed to keep your passport or residence card.", "", null, true),
                    Article("b", ArticleCategory.RIGHTS, null, "Your wages", "Wages must be paid every month, in full, as written in your contract.", "", null, true),
                    Article("c", ArticleCategory.RIGHTS, null, "Rest, hours and your day off", "You have the right to daily rest and a weekly day off.", "", null, true),
                ),
                isLoading = false,
            ),
            {}, {}, {},
        )
    }

    @Test fun health() = snap("10_health") {
        HealthScreen(
            listOf(
                Article("h1", ArticleCategory.HEALTH, null, "Stress and your period", "Stress can make your period late or irregular. This is common.", "", null, true),
                Article("h2", ArticleCategory.HEALTH, null, "Pregnancy abroad: know your options", "In some countries pregnancy outside marriage is a crime.", "", null, true),
            ),
            {}, {}, {}, {},
        )
    }

    @Test fun returnHome() = snap("11_return") {
        ArticlesScreen(
            ArticlesUiState(
                category = ArticleCategory.RETURN,
                articles = listOf(
                    Article("r1", ArticleCategory.RETURN, null, "Coming home: talk to someone", "Returning can be hard. Feelings of shame or fear are normal and they pass.", "", null, true),
                    Article("r2", ArticleCategory.RETURN, null, "Claiming unpaid wages", "You can still claim money you are owed after you return.", "", null, true),
                ),
                services = TestData.saudiDirectory.sections.last().contacts,
                isLoading = false,
            ),
            {}, {}, {},
        )
    }

    @Test fun more() = snap("12_more") { MoreScreen({}, "6.0.0") }
}
