package org.recitelabs.dadalink.feature.health

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
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
import javax.inject.Inject

@HiltViewModel
class HealthViewModel @Inject constructor(settings: SettingsRepository, content: ContentRepository) : ViewModel() {
    @OptIn(ExperimentalCoroutinesApi::class)
    val articles: StateFlow<List<Article>> = settings.settings
        .mapLatest { content.articles(ArticleCategory.HEALTH, null, it.language) }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())
}
