package org.recitelabs.dadalink

import android.os.Build
import android.os.Bundle
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.app.AppCompatDelegate
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.getValue
import androidx.core.os.LocaleListCompat
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.filterIsInstance
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.launch
import org.recitelabs.dadalink.core.designsystem.theme.DadaTheme
import org.recitelabs.dadalink.core.designsystem.theme.Script
import org.recitelabs.dadalink.core.ui.LocalQuickExit
import org.recitelabs.dadalink.core.ui.script
import org.recitelabs.dadalink.ui.DadaLinkApp

@AndroidEntryPoint
class MainActivity : AppCompatActivity() {
    private val viewModel: MainActivityViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        val splash = installSplashScreen()
        super.onCreate(savedInstanceState)
        splash.setKeepOnScreenCondition { viewModel.uiState.value is MainUiState.Loading }
        enableEdgeToEdge()
        // Recents shows a blank card for the whole app, not just FLAG_SECURE screens.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) setRecentsScreenshotEnabled(false)

        lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.uiState
                    .filterIsInstance<MainUiState.Ready>()
                    .map { it.settings.language.tag }
                    .distinctUntilChanged()
                    .collect(::applyLanguage)
            }
        }

        setContent {
            val state by viewModel.uiState.collectAsStateWithLifecycle()
            val script = (state as? MainUiState.Ready)?.settings?.language?.script ?: Script.Latin
            DadaTheme(script = script) {
                CompositionLocalProvider(LocalQuickExit provides ::quickExit) {
                    DadaLinkApp(state)
                }
            }
        }
    }

    /** "Hide": lock, leave, and remove the task from Recents. */
    private fun quickExit() {
        viewModel.lock()
        finishAndRemoveTask()
    }

    private fun applyLanguage(tag: String) {
        val desired = LocaleListCompat.forLanguageTags(tag)
        if (AppCompatDelegate.getApplicationLocales().toLanguageTags() != desired.toLanguageTags()) {
            AppCompatDelegate.setApplicationLocales(desired)
        }
    }
}
