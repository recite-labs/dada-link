package org.recitelabs.dadalink.core.ui

import androidx.annotation.StringRes
import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import org.recitelabs.dadalink.core.model.Country

@get:StringRes
val Country.nameRes: Int
    get() = when (this) {
        Country.SAUDI_ARABIA -> R.string.core_ui_country_sa
        Country.UAE -> R.string.core_ui_country_ae
        Country.KUWAIT -> R.string.core_ui_country_kw
        Country.QATAR -> R.string.core_ui_country_qa
        Country.LEBANON -> R.string.core_ui_country_lb
        Country.JORDAN -> R.string.core_ui_country_jo
        Country.ETHIOPIA -> R.string.core_ui_country_et
    }

@Composable
fun Country.localizedName(): String = stringResource(nameRes)
