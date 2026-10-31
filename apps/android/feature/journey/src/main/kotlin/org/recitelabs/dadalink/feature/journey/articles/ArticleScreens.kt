package org.recitelabs.dadalink.feature.journey.articles

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import org.recitelabs.dadalink.core.designsystem.component.DadaBadge
import org.recitelabs.dadalink.core.designsystem.component.DadaCard
import org.recitelabs.dadalink.core.designsystem.component.DadaListRow
import org.recitelabs.dadalink.core.designsystem.component.DadaOutlinedButton
import org.recitelabs.dadalink.core.designsystem.component.SectionHeader
import org.recitelabs.dadalink.core.designsystem.icon.DadaIcons
import org.recitelabs.dadalink.core.designsystem.theme.DadaTheme
import org.recitelabs.dadalink.core.model.Article
import org.recitelabs.dadalink.core.model.ArticleCategory
import org.recitelabs.dadalink.core.model.HelpContact
import org.recitelabs.dadalink.core.ui.DadaScreen
import org.recitelabs.dadalink.core.ui.PhonePreviews
import org.recitelabs.dadalink.core.ui.dial
import org.recitelabs.dadalink.core.ui.localizedName
import org.recitelabs.dadalink.feature.journey.R
import org.recitelabs.dadalink.core.ui.R as CoreUiR

@Composable
internal fun ArticlesDestination(onBack: () -> Unit, onOpen: (String) -> Unit, viewModel: ArticlesViewModel = hiltViewModel()) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val context = LocalContext.current
    ArticlesScreen(state, onBack, onOpen, onCall = { context.dial(it) })
}

/** 09 Contract & rights · Before you go · 11 Coming home. */
@Composable
fun ArticlesScreen(
    state: ArticlesUiState,
    onBack: () -> Unit,
    onOpen: (String) -> Unit,
    onCall: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    val title = when (state.category) {
        ArticleCategory.RIGHTS -> R.string.journey_rights_title
        ArticleCategory.BEFORE_YOU_GO -> R.string.journey_before_title
        ArticleCategory.RETURN -> R.string.journey_return_title
        ArticleCategory.HEALTH -> R.string.journey_article
    }
    DadaScreen(title = stringResource(title), onBack = onBack, modifier = modifier) {
        LazyColumn(
            contentPadding = PaddingValues(horizontal = DadaTheme.spacing.screen, vertical = 8.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            item {
                val intro = when (state.category) {
                    ArticleCategory.RIGHTS -> stringResource(R.string.journey_rights_intro, state.country.localizedName())
                    ArticleCategory.RETURN -> stringResource(R.string.journey_return_intro)
                    else -> null
                }
                intro?.let { Text(it, style = DadaTheme.typography.body, color = DadaTheme.colors.muted) }
            }
            items(state.articles, key = { it.id }) { ArticleCard(it, onOpen) }
            if (state.services.isNotEmpty()) {
                item { SectionHeader(stringResource(R.string.journey_return_services)) }
                items(state.services, key = { it.id }) { ServiceRow(it, onCall) }
            }
        }
    }
}

@Composable
internal fun ArticleCard(article: Article, onOpen: (String) -> Unit) {
    val colors = DadaTheme.colors
    DadaCard(
        modifier = Modifier.fillMaxWidth(),
        onClick = { onOpen(article.id) },
        containerColor = colors.ground,
        border = BorderStroke(1.dp, colors.line),
        shape = DadaTheme.shapes.cardLarge,
    ) {
        Text(article.title, style = DadaTheme.typography.titleSmall, color = colors.ink)
        Text(article.summary, style = DadaTheme.typography.bodySmall, color = colors.muted)
        if (article.isDraft) {
            DadaBadge(stringResource(CoreUiR.string.core_ui_draft_content), containerColor = colors.accentTint, contentColor = colors.ink, modifier = Modifier.padding(top = 8.dp))
        }
    }
}

@Composable
private fun ServiceRow(contact: HelpContact, onCall: (String) -> Unit) {
    DadaListRow(
        title = contact.name,
        subtitle = contact.phone ?: stringResource(CoreUiR.string.core_ui_number_pending),
        icon = DadaIcons.Help,
        trailing = contact.phone?.let { number ->
            {
                IconButton(onClick = { onCall(number) }) {
                    Icon(DadaIcons.Call, contentDescription = stringResource(CoreUiR.string.core_ui_call), tint = DadaTheme.colors.primary)
                }
            }
        },
    )
}

@Composable
internal fun ArticleDestination(onBack: () -> Unit, onAsk: (String) -> Unit, viewModel: ArticleViewModel = hiltViewModel()) {
    val article by viewModel.article.collectAsStateWithLifecycle()
    ArticleScreen(article, onBack, onAsk)
}

@Composable
fun ArticleScreen(article: Article?, onBack: () -> Unit, onAsk: (String) -> Unit, modifier: Modifier = Modifier) {
    DadaScreen(title = stringResource(R.string.journey_article), onBack = onBack, modifier = modifier) {
        if (article == null) return@DadaScreen
        Column(
            Modifier.verticalScroll(rememberScrollState()).padding(horizontal = DadaTheme.spacing.screen, vertical = 8.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Text(article.title, style = DadaTheme.typography.headline, color = DadaTheme.colors.ink)
            if (article.isDraft) DadaBadge(stringResource(CoreUiR.string.core_ui_draft_content), containerColor = DadaTheme.colors.accentTint, contentColor = DadaTheme.colors.ink)
            article.reviewedBy?.let { DadaBadge(stringResource(R.string.journey_reviewed_by, it), icon = DadaIcons.CheckCircle) }
            Text(article.summary, style = DadaTheme.typography.titleSmall, color = DadaTheme.colors.ink)
            Text(article.body, style = DadaTheme.typography.body, color = DadaTheme.colors.ink)
            DadaOutlinedButton(stringResource(R.string.journey_ask_about), onClick = { onAsk(article.title) }, leadingIcon = DadaIcons.Ask)
            Text(stringResource(CoreUiR.string.core_ui_disclaimer), style = DadaTheme.typography.caption, color = DadaTheme.colors.muted)
        }
    }
}


@PhonePreviews
@Composable
private fun RightsPreview() = DadaTheme {
    ArticlesScreen(
        ArticlesUiState(
            category = ArticleCategory.RIGHTS,
            articles = listOf(
                Article("a", ArticleCategory.RIGHTS, null, "Your passport is yours", "Your employer is not allowed to keep your passport.", "", null, true),
                Article("b", ArticleCategory.RIGHTS, null, "Your wages", "Wages must be paid every month, in full.", "", null, true),
            ),
            isLoading = false,
        ),
        {}, {}, {},
    )
}
