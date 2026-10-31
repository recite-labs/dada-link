package org.recitelabs.dadalink.feature.disguise.notes

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import org.recitelabs.dadalink.core.domain.usecase.UnlockWithPinUseCase
import org.recitelabs.dadalink.core.ui.PhonePreviews
import org.recitelabs.dadalink.feature.disguise.R
import javax.inject.Inject

/** Notes disguise: searching for the PIN unlocks; anything else just shows "No results". */
@HiltViewModel
class NotesViewModel @Inject constructor(private val unlockWithPin: UnlockWithPinUseCase) : ViewModel() {
    fun search(query: String) {
        val trimmed = query.trim()
        if (trimmed.length == 4 && trimmed.all(Char::isDigit)) viewModelScope.launch { unlockWithPin(trimmed) }
    }
}

@Composable
fun NotesDestination(viewModel: NotesViewModel = hiltViewModel()) = NotesScreen(onSearch = viewModel::search)

@Composable
fun NotesScreen(onSearch: (String) -> Unit, modifier: Modifier = Modifier) {
    var query by rememberSaveable { mutableStateOf("") }
    var searched by rememberSaveable { mutableStateOf(false) }
    Column(
        modifier = modifier.fillMaxSize().background(Color(0xFFFFFBF2)).statusBarsPadding().padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        Text(stringResource(R.string.disguise_notes), fontSize = 32.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Serif, color = Color(0xFF3A3A3A))
        OutlinedTextField(
            value = query,
            onValueChange = { query = it; searched = false },
            modifier = Modifier.fillMaxWidth(),
            placeholder = { Text(stringResource(R.string.disguise_notes_search)) },
            singleLine = true,
            keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
            keyboardActions = KeyboardActions(onSearch = { onSearch(query); searched = true; query = "" }),
        )
        Box(Modifier.fillMaxWidth().weight(1f), contentAlignment = Alignment.Center) {
            Text(
                stringResource(if (searched) R.string.disguise_notes_no_results else R.string.disguise_notes_empty),
                color = Color(0xFF8A8A8A),
                fontFamily = FontFamily.Serif,
            )
        }
    }
}

@PhonePreviews
@Composable
private fun NotesPreview() = NotesScreen({})
