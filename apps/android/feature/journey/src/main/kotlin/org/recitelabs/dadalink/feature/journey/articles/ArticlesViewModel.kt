package org.recitelabs.dadalink.feature.journey.articles

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.navigation.toRoute
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.mapLatest
import kotlinx.coroutines.flow.stateIn
import org.recitelabs.dadalink.core.domain.repository.ContentRepository
import org.recitelabs.dadalink.core.domain.repository.SettingsRepository
import org.recitelabs.dadalink.core.model.Article
import org.recitelabs.dadalink.core.model.ArticleCategory
import org.recitelabs.dadalink.core.model.Country
import org.recitelabs.dadalink.core.model.HelpContact
import org.recitelabs.dadalink.feature.journey.navigation.ArticlesRoute
import javax.inject.Inject

data class ArticlesUiState(
    val category: ArticleCategory,
    val country: Country = Country.SAUDI_ARABIA,
    val articles: List<Article> = emptyList(),
    /** Returnee services (Ethiopia directory) shown on the "Coming home" screen. */
    val services: List<HelpContact> = emptyList(),
    val isLoading: Boolean = true,
)

@HiltViewModel
class ArticlesViewModel @Inject constructor(
    settings: SettingsRepository,
    content: ContentRepository,
    savedStateHandle: SavedStateHandle,
) : ViewModel() {
    private val category = savedStateHandle.toRoute<ArticlesRoute>().category

    @OptIn(ExperimentalCoroutinesApi::class)
    val uiState: StateFlow<ArticlesUiState> = settings.settings.mapLatest { s ->
        val country = if (category == ArticleCategory.RIGHTS) s.country else null
        val services = if (category == ArticleCategory.RETURN) {
            content.helpDirectory(Country.ETHIOPIA, s.language)?.sections?.flatMap { it.contacts }.orEmpty()
        } else {
            emptyList()
        }
        ArticlesUiState(category, s.country, content.articles(category, country, s.language), services, isLoading = false)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), ArticlesUiState(category))
}
