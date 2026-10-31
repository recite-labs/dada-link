package org.recitelabs.dadalink.feature.journey.navigation

import androidx.navigation.NavController
import androidx.navigation.NavGraphBuilder
import androidx.navigation.compose.composable
import kotlinx.serialization.Serializable
import org.recitelabs.dadalink.core.model.ArticleCategory
import org.recitelabs.dadalink.feature.journey.agency.AgencyCheckDestination
import org.recitelabs.dadalink.feature.journey.articles.ArticleDestination
import org.recitelabs.dadalink.feature.journey.articles.ArticlesDestination

@Serializable data object AgencyCheckRoute

/** The category travels by name: :core:model is plain Kotlin and cannot carry @Keep for R8. */
@Serializable data class ArticlesRoute(val categoryName: String) {
    constructor(category: ArticleCategory) : this(category.name)

    val category: ArticleCategory get() = ArticleCategory.valueOf(categoryName)
}

@Serializable data class ArticleRoute(val id: String)

fun NavController.navigateToArticles(category: ArticleCategory) = navigate(ArticlesRoute(category)) { launchSingleTop = true }

fun NavController.navigateToArticle(id: String) = navigate(ArticleRoute(id))

fun NavGraphBuilder.journeyScreens(navController: NavController, onAsk: (String) -> Unit) {
    composable<AgencyCheckRoute> { AgencyCheckDestination(onBack = navController::popBackStack, onAsk = onAsk) }
    composable<ArticlesRoute> { ArticlesDestination(onBack = navController::popBackStack, onOpen = navController::navigateToArticle) }
    composable<ArticleRoute> { ArticleDestination(onBack = navController::popBackStack, onAsk = onAsk) }
}
