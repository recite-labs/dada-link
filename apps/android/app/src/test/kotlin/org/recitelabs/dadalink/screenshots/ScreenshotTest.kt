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
                        sources = listOf(SourceRef("Your rights as a domestic worker in Saudi Arabia", "DadaLink content team")),
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
                    Article("rights-sa", ArticleCategory.RIGHTS, Country.SAUDI_ARABIA, "Your rights as a domestic worker in Saudi Arabia", "Saudi Arabia has a special regulation for domestic workers. It gives you a contract, monthly pay, a weekly day off, limits on working hours, and says your employer must not keep your passport.", "", null, false),
                    Article("passport-taken", ArticleCategory.RIGHTS, null, "My employer took my passport", "Your passport belongs to you. Here is what the law says in some countries, and safe steps you can take if your employer keeps it.", "", null, false),
                    Article("unpaid-wages", ArticleCategory.RIGHTS, null, "My employer is not paying my salary", "You have the right to be paid for your work. Keep a record of every payment and know where to complain.", "", null, false),
                    Article("rest-and-working-hours", ArticleCategory.RIGHTS, null, "Rest, sleep and my day off", "You need rest to stay healthy. Many countries give domestic workers daily rest and a weekly day off. Keep a log and know where to complain.", "", null, false),
                ),
                isLoading = false,
            ),
            {}, {}, {},
        )
    }

    @Test fun health() = snap("10_health") {
        HealthScreen(
            listOf(
                Article("pregnancy-abroad", ArticleCategory.HEALTH, null, "I think I am pregnant", "Finding out you are pregnant far from home can be frightening. You are not alone. Here is how to look after your health and get confidential help.", "", null, false),
                Article("loneliness-and-mental-health", ArticleCategory.HEALTH, null, "Feeling lonely, sad or stressed", "Missing home, feeling sad or worried is normal. Here are small things that can help, signs you need more help, and what to do if you feel you cannot go on.", "", null, false),
            ),
            {}, {}, {}, {},
        )
    }

    @Test fun returnHome() = snap("11_return") {
        ArticlesScreen(
            ArticlesUiState(
                category = ArticleCategory.RETURN,
                articles = listOf(
                    Article("arriving-home", ArticleCategory.RETURN, null, "Arriving home at Bole airport", "What usually happens when returnees land in Addis Ababa, and what help you can ask for with food, shelter, health, counselling and getting home.", "", null, false),
                    Article("claiming-unpaid-wages-after-return", ArticleCategory.RETURN, null, "Claiming unpaid wages after you are home", "Getting your unpaid pay from home is hard, but you can still try. Keep your evidence and ask the embassy, your agency and legal helpers.", "", null, false),
                ),
                services = TestData.saudiDirectory.sections.last().contacts,
                isLoading = false,
            ),
            {}, {}, {},
        )
    }

    @Test fun more() = snap("12_more") { MoreScreen({}, "6.0.0") }
}
