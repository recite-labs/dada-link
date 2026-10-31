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
import org.recitelabs.dadalink.feature.journey.navigation.ArticleRoute
import javax.inject.Inject

@HiltViewModel
class ArticleViewModel @Inject constructor(
    settings: SettingsRepository,
    content: ContentRepository,
    savedStateHandle: SavedStateHandle,
) : ViewModel() {
    private val id = savedStateHandle.toRoute<ArticleRoute>().id

    @OptIn(ExperimentalCoroutinesApi::class)
    val article: StateFlow<Article?> = settings.settings
        .mapLatest { content.article(id, it.language) }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), null)
}
