package org.recitelabs.dadalink.core.data

import org.recitelabs.dadalink.core.model.AppLanguage

/** API `Locale` literal for an app language (all app languages are accepted; see OpenApiContractTest). */
internal val AppLanguage.wireLocale: String get() = tag
