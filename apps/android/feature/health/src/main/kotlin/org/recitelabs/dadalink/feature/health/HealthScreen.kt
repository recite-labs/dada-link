package org.recitelabs.dadalink.feature.health

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import org.recitelabs.dadalink.core.designsystem.component.DadaBadge
import org.recitelabs.dadalink.core.designsystem.component.DadaCard
import org.recitelabs.dadalink.core.designsystem.component.DadaChip
import org.recitelabs.dadalink.core.designsystem.component.DadaListRow
import org.recitelabs.dadalink.core.designsystem.component.SectionHeader
import org.recitelabs.dadalink.core.designsystem.icon.DadaIcons
import org.recitelabs.dadalink.core.designsystem.theme.DadaTheme
import org.recitelabs.dadalink.core.model.Article
import org.recitelabs.dadalink.core.model.ArticleCategory
import org.recitelabs.dadalink.core.ui.DadaScreen
import org.recitelabs.dadalink.core.ui.PhonePreviews
import org.recitelabs.dadalink.core.ui.R as CoreUiR

@Composable
internal fun HealthDestination(
    onBack: () -> Unit,
    onAsk: (String) -> Unit,
    onOpenArticle: (String) -> Unit,
    onHelp: () -> Unit,
    viewModel: HealthViewModel = hiltViewModel(),
) {
    val articles by viewModel.articles.collectAsStateWithLifecycle()
    HealthScreen(articles, onBack, onAsk, onOpenArticle, onHelp)
}

/** 10 Health: private questions to Dada, reviewed topics, and a way to talk to someone. */
@OptIn(ExperimentalLayoutApi::class)
@Composable
fun HealthScreen(
    articles: List<Article>,
    onBack: () -> Unit,
    onAsk: (String) -> Unit,
    onOpenArticle: (String) -> Unit,
    onHelp: () -> Unit,
    modifier: Modifier = Modifier,
) {
    DadaScreen(title = stringResource(R.string.health_title), onBack = onBack, modifier = modifier) {
        LazyColumn(
            contentPadding = PaddingValues(horizontal = DadaTheme.spacing.screen, vertical = 8.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            item { Text(stringResource(R.string.health_intro), style = DadaTheme.typography.body, color = DadaTheme.colors.muted) }
            item { SectionHeader(stringResource(R.string.health_quick_questions)) }
            item {
                FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    listOf(R.string.health_ask_period, R.string.health_ask_pregnancy, R.string.health_ask_sleep).forEach { res ->
                        val question = stringResource(res)
                        DadaChip(text = question, onClick = { onAsk(question) })
                    }
                }
            }
            item { SectionHeader(stringResource(R.string.health_topics)) }
            items(articles, key = { it.id }) { article ->
                DadaCard(
                    modifier = Modifier.fillMaxWidth(),
                    onClick = { onOpenArticle(article.id) },
                    containerColor = DadaTheme.colors.ground,
                    border = BorderStroke(1.dp, DadaTheme.colors.line),
                    shape = DadaTheme.shapes.cardLarge,
                ) {
                    Text(article.title, style = DadaTheme.typography.titleSmall, color = DadaTheme.colors.ink)
                    Text(article.summary, style = DadaTheme.typography.bodySmall, color = DadaTheme.colors.muted)
                    if (article.isDraft) {
                        DadaBadge(
                            stringResource(CoreUiR.string.core_ui_draft_content),
                            containerColor = DadaTheme.colors.accentTint,
                            contentColor = DadaTheme.colors.ink,
                            modifier = Modifier.padding(top = 8.dp),
                        )
                    }
                }
            }
            item {
                DadaListRow(
                    title = stringResource(R.string.health_talk_title),
                    subtitle = stringResource(R.string.health_talk_body),
                    icon = DadaIcons.Help,
                    onClick = onHelp,
                )
            }
        }
    }
}

@PhonePreviews
@Composable
private fun HealthPreview() = DadaTheme {
    HealthScreen(
        listOf(Article("h", ArticleCategory.HEALTH, null, "Stress and your period", "Stress can make your period late.", "", null, true)),
        {}, {}, {}, {},
    )
}
