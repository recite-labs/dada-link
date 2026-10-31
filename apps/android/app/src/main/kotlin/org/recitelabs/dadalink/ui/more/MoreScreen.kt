package org.recitelabs.dadalink.ui.more

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import kotlinx.serialization.Serializable
import org.recitelabs.dadalink.BuildConfig
import org.recitelabs.dadalink.R
import org.recitelabs.dadalink.core.designsystem.component.DadaListRow
import org.recitelabs.dadalink.core.designsystem.component.SectionHeader
import org.recitelabs.dadalink.core.designsystem.icon.DadaIcons
import org.recitelabs.dadalink.core.designsystem.theme.DadaTheme
import org.recitelabs.dadalink.core.ui.DadaScreen
import org.recitelabs.dadalink.core.ui.PhonePreviews

@Serializable data object MoreRoute

enum class MoreTarget { BEFORE, AGENCY, RIGHTS, HEALTH, RETURN, LOG, SETTINGS }

@Composable
fun MoreDestination(onOpen: (MoreTarget) -> Unit) = MoreScreen(onOpen, BuildConfig.VERSION_NAME)

/** The whole journey, thin: before, abroad, return — plus private tools and settings. */
@Composable
fun MoreScreen(onOpen: (MoreTarget) -> Unit, version: String, modifier: Modifier = Modifier) {
    data class Row(val target: MoreTarget, val title: Int, val body: Int, val icon: ImageVector)
    val journey = listOf(
        Row(MoreTarget.BEFORE, R.string.more_before, R.string.more_before_body, DadaIcons.Log),
        Row(MoreTarget.AGENCY, R.string.more_agency, R.string.more_agency_body, DadaIcons.Agency),
        Row(MoreTarget.RIGHTS, R.string.more_rights, R.string.more_rights_body, DadaIcons.Rights),
        Row(MoreTarget.HEALTH, R.string.more_health, R.string.more_health_body, DadaIcons.Health),
        Row(MoreTarget.RETURN, R.string.more_return, R.string.more_return_body, DadaIcons.Return),
    )
    val private = listOf(
        Row(MoreTarget.LOG, R.string.more_log, R.string.more_log_body, DadaIcons.Lock),
        Row(MoreTarget.SETTINGS, R.string.more_settings, R.string.more_settings_body, DadaIcons.Shield),
    )
    DadaScreen(title = stringResource(R.string.more_title), onBack = null, modifier = modifier) {
        LazyColumn(
            contentPadding = PaddingValues(horizontal = DadaTheme.spacing.screen, vertical = 8.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            item { SectionHeader(stringResource(R.string.more_journey)) }
            journey.forEach { row ->
                item(row.target.name) {
                    DadaListRow(stringResource(row.title), subtitle = stringResource(row.body), icon = row.icon, onClick = { onOpen(row.target) })
                }
            }
            item { SectionHeader(stringResource(R.string.more_private)) }
            private.forEach { row ->
                item(row.target.name) {
                    DadaListRow(stringResource(row.title), subtitle = stringResource(row.body), icon = row.icon, onClick = { onOpen(row.target) })
                }
            }
            item { Text(stringResource(R.string.more_about, version), style = DadaTheme.typography.caption, color = DadaTheme.colors.muted) }
        }
    }
}

@PhonePreviews
@Composable
private fun MorePreview() = DadaTheme { MoreScreen({}, "6.0.0") }
