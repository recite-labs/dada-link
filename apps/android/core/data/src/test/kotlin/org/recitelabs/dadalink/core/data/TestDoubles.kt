package org.recitelabs.dadalink.core.data

import androidx.datastore.core.DataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import org.recitelabs.dadalink.core.datastore.SettingsDataSource
import org.recitelabs.dadalink.core.datastore.StoredSettings
import org.recitelabs.dadalink.core.network.AgencyApi
import org.recitelabs.dadalink.core.network.AssistantApi
import org.recitelabs.dadalink.core.network.ContentApi
import org.recitelabs.dadalink.core.network.SosApi
import org.recitelabs.dadalink.core.network.model.AgencyCheckDto
import org.recitelabs.dadalink.core.network.model.AskRequestDto
import org.recitelabs.dadalink.core.network.model.AskResponseDto
import org.recitelabs.dadalink.core.network.model.AssistantFeedbackDto
import org.recitelabs.dadalink.core.network.model.AssistantStreamEventDto
import org.recitelabs.dadalink.core.network.model.ContentSummaryDto
import org.recitelabs.dadalink.core.network.model.DirectoryEntryDto
import org.recitelabs.dadalink.core.network.model.EmergencyContactDto
import org.recitelabs.dadalink.core.network.model.LocalizedContentDto
import org.recitelabs.dadalink.core.network.model.SosRequestDto
import org.recitelabs.dadalink.core.network.model.SosResultDto

class MemoryDataStore<T>(initial: T) : DataStore<T> {
    private val state = MutableStateFlow(initial)
    private val mutex = Mutex()
    override val data: Flow<T> = state
    override suspend fun updateData(transform: suspend (t: T) -> T): T = mutex.withLock { transform(state.value).also { state.value = it } }
}

fun settingsSource(initial: StoredSettings = StoredSettings()) = SettingsDataSource(MemoryDataStore(initial))

/** Serves canned API data; set [failWith] to simulate being offline. */
class FakeContentApi(
    var directories: Map<String, List<DirectoryEntryDto>> = emptyMap(),
    var items: List<LocalizedContentDto> = emptyList(),
) : ContentApi {
    var failWith: Exception? = null
    var failItemsWith: Exception? = null
    val calls = mutableListOf<String>()

    override suspend fun list(locale: String?, country: String?, phase: String?, kind: String?, topic: String?): List<ContentSummaryDto> {
        calls += "list:$locale"
        failWith?.let { throw it }
        return items.map { ContentSummaryDto(it.id, it.kind, it.phase, it.countries, it.topics, it.locale, it.status, it.title, it.summary, it.sensitive) }
    }

    override suspend fun item(id: String, locale: String?): LocalizedContentDto? {
        calls += "item:$id"
        failItemsWith?.let { throw it }
        return items.firstOrNull { it.id == id }?.copy(requestedLocale = locale ?: "en")
    }

    override suspend fun directory(country: String): List<DirectoryEntryDto> {
        calls += "directory:$country"
        failWith?.let { throw it }
        return directories[country].orEmpty()
    }

    override suspend fun emergencyContacts(country: String, locale: String?): List<EmergencyContactDto> = emptyList()
}

class FakeAssistantApi(var events: List<AssistantStreamEventDto> = emptyList(), var failure: Exception? = null) : AssistantApi {
    val requests = mutableListOf<AskRequestDto>()
    val feedback = mutableListOf<AssistantFeedbackDto>()
    var feedbackFailure: Exception? = null

    override suspend fun ask(request: AskRequestDto): AskResponseDto = error("not used")

    override fun stream(request: AskRequestDto) = flow {
        requests += request
        events.forEach { emit(it) }
        failure?.let { throw it }
    }

    override suspend fun feedback(feedback: AssistantFeedbackDto) {
        feedbackFailure?.let { throw it }
        this.feedback += feedback
    }
}

class FakeAgencyApi(var result: () -> AgencyCheckDto) : AgencyApi {
    override suspend fun check(query: String) = result()
}

class FakeSosApi(var result: () -> SosResultDto = { SosResultDto(listOf("sms"), emptyList()) }) : SosApi {
    val requests = mutableListOf<SosRequestDto>()
    override suspend fun relay(request: SosRequestDto): SosResultDto {
        requests += request
        return result()
    }
}

object Dtos {
    fun entry(
        id: String,
        kind: String,
        phone: String? = null,
        shortCode: String? = null,
        emergency: Boolean = false,
        country: String = "SA",
        nameAm: String? = null,
        notes: String? = null,
    ) = DirectoryEntryDto(
        id = id, country = country, kind = kind, name = id.replace('-', ' '),
        names = nameAm?.let { org.recitelabs.dadalink.core.network.model.LocalizedNamesDto(am = it) },
        phone = phone, shortCode = shortCode, notes = notes, emergency = emergency, sourceUrl = "https://example.org", verified = false,
    )

    fun content(id: String, kind: String = "article", phase: String? = "abroad", countries: List<String> = listOf("SA"), topics: List<String> = listOf("wages")) =
        LocalizedContentDto(
            id = id, kind = kind, phase = phase, countries = countries, topics = topics, sources = emptyList(), locale = "en",
            requestedLocale = "en", status = "reviewed", title = "Title $id", summary = "Summary $id", body = "## Body $id",
            availableLocales = listOf("en"), sensitive = false, related = emptyList(),
        )

    val saudi = listOf(
        entry("sa-unified-emergency", "emergency", shortCode = "911", emergency = true, nameAm = "የተዋሃደ የአስቸኳይ ጊዜ ቁጥር"),
        entry("sa-police", "police", shortCode = "999", emergency = true),
        entry("sa-embassy-ethiopia-riyadh", "embassy", phone = "+966114823919"),
        entry("sa-mhrsd-call-center", "labour-hotline", shortCode = "19911", notes = "Labour complaints"),
        entry("sa-shelter-riyadh", "shelter", phone = "+966540659565"),
        entry("sa-iom", "iom"),
    )
}
