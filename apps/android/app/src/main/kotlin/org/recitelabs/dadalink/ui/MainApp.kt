package org.recitelabs.dadalink.ui

import androidx.compose.foundation.layout.consumeWindowInsets
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.navigation.NavController
import androidx.navigation.NavDestination
import androidx.navigation.NavDestination.Companion.hasRoute
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import org.recitelabs.dadalink.R
import org.recitelabs.dadalink.core.designsystem.component.BottomBarItem
import org.recitelabs.dadalink.core.designsystem.component.DadaBottomBar
import org.recitelabs.dadalink.core.designsystem.icon.DadaIcons
import org.recitelabs.dadalink.core.designsystem.theme.DadaTheme
import org.recitelabs.dadalink.core.model.ArticleCategory
import org.recitelabs.dadalink.feature.assistant.navigation.AskRoute
import org.recitelabs.dadalink.feature.assistant.navigation.askScreen
import org.recitelabs.dadalink.feature.assistant.navigation.navigateToAsk
import org.recitelabs.dadalink.feature.health.navigation.HealthRoute
import org.recitelabs.dadalink.feature.health.navigation.healthScreen
import org.recitelabs.dadalink.feature.help.navigation.HelpRoute
import org.recitelabs.dadalink.feature.help.navigation.helpScreen
import org.recitelabs.dadalink.feature.home.HomeTarget
import org.recitelabs.dadalink.feature.home.navigation.HomeRoute
import org.recitelabs.dadalink.feature.home.navigation.homeScreen
import org.recitelabs.dadalink.feature.journey.navigation.AgencyCheckRoute
import org.recitelabs.dadalink.feature.journey.navigation.journeyScreens
import org.recitelabs.dadalink.feature.journey.navigation.navigateToArticle
import org.recitelabs.dadalink.feature.journey.navigation.navigateToArticles
import org.recitelabs.dadalink.feature.log.navigation.logScreens
import org.recitelabs.dadalink.feature.log.navigation.navigateToLog
import org.recitelabs.dadalink.feature.onboarding.navigation.navigateToSafetySettings
import org.recitelabs.dadalink.feature.onboarding.navigation.safetySettingsScreen
import org.recitelabs.dadalink.feature.sos.navigation.navigateToSos
import org.recitelabs.dadalink.feature.sos.navigation.sosScreens
import org.recitelabs.dadalink.ui.more.MoreDestination
import org.recitelabs.dadalink.ui.more.MoreRoute
import org.recitelabs.dadalink.ui.more.MoreTarget

private enum class Tab { HOME, ASK, HELP, MORE }

@Composable
fun MainApp() {
    val navController = rememberNavController()
    val entry by navController.currentBackStackEntryAsState()
    val currentTab = entry?.destination?.tab()

    val items = listOf(
        BottomBarItem(Tab.HOME.name, stringResource(R.string.nav_home), DadaIcons.Home),
        BottomBarItem(Tab.ASK.name, stringResource(R.string.nav_ask), DadaIcons.Ask),
        BottomBarItem(Tab.HELP.name, stringResource(R.string.nav_help), DadaIcons.Help),
        BottomBarItem(Tab.MORE.name, stringResource(R.string.nav_more), DadaIcons.More),
    )

    Scaffold(
        containerColor = DadaTheme.colors.ground,
        bottomBar = {
            if (currentTab != null) {
                DadaBottomBar(
                    items = items,
                    selectedKey = currentTab.name,
                    onSelect = { navController.navigateToTab(Tab.valueOf(it.key)) },
                    sosLabel = stringResource(R.string.nav_sos),
                    onSos = navController::navigateToSos,
                )
            }
        },
    ) { padding ->
        NavHost(
            navController = navController,
            startDestination = HomeRoute,
            modifier = Modifier.padding(padding).consumeWindowInsets(padding),
        ) {
            homeScreen(
                onAsk = { question, voice -> navController.navigateToAsk(question, voice) },
                onOpen = { target ->
                    when (target) {
                        HomeTarget.HELP -> navController.navigateToTab(Tab.HELP)
                        HomeTarget.LOG -> navController.navigateToLog()
                        HomeTarget.HEALTH -> navController.navigate(HealthRoute)
                        HomeTarget.RIGHTS -> navController.navigateToArticles(ArticleCategory.RIGHTS)
                        HomeTarget.SETTINGS -> navController.navigateToSafetySettings()
                    }
                },
            )
            askScreen(onBack = null, onSos = navController::navigateToSos)
            helpScreen()
            sosScreens(
                navController,
                onAddContact = navController::navigateToSafetySettings,
                onSafe = { navController.navigateToTab(Tab.HOME) },
            )
            logScreens(navController)
            journeyScreens(navController, onAsk = { navController.navigateToAsk(it) })
            healthScreen(
                navController,
                onAsk = { navController.navigateToAsk(it) },
                onOpenArticle = navController::navigateToArticle,
                onHelp = { navController.navigateToTab(Tab.HELP) },
            )
            safetySettingsScreen(navController)
            composable<MoreRoute> {
                MoreDestination(onOpen = { target ->
                    when (target) {
                        MoreTarget.BEFORE -> navController.navigateToArticles(ArticleCategory.BEFORE_YOU_GO)
                        MoreTarget.AGENCY -> navController.navigate(AgencyCheckRoute)
                        MoreTarget.RIGHTS -> navController.navigateToArticles(ArticleCategory.RIGHTS)
                        MoreTarget.HEALTH -> navController.navigate(HealthRoute)
                        MoreTarget.RETURN -> navController.navigateToArticles(ArticleCategory.RETURN)
                        MoreTarget.LOG -> navController.navigateToLog()
                        MoreTarget.SETTINGS -> navController.navigateToSafetySettings()
                    }
                })
            }
        }
    }
}

private fun NavDestination.tab(): Tab? = when {
    hasRoute(HomeRoute::class) -> Tab.HOME
    hasRoute(AskRoute::class) -> Tab.ASK
    hasRoute(HelpRoute::class) -> Tab.HELP
    hasRoute(MoreRoute::class) -> Tab.MORE
    else -> null
}

private fun NavController.navigateToTab(tab: Tab) {
    val route: Any = when (tab) {
        Tab.HOME -> HomeRoute
        Tab.ASK -> AskRoute()
        Tab.HELP -> HelpRoute
        Tab.MORE -> MoreRoute
    }
    navigate(route) {
        popUpTo(graph.findStartDestination().id) { saveState = true }
        launchSingleTop = true
        restoreState = true
    }
}
