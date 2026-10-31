package org.recitelabs.dadalink.core.ui

import org.recitelabs.dadalink.core.designsystem.theme.Script
import org.recitelabs.dadalink.core.model.AppLanguage

val AppLanguage.script: Script get() = if (isEthiopicScript) Script.Ethiopic else Script.Latin
