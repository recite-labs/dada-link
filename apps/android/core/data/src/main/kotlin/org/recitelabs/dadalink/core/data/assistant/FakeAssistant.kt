package org.recitelabs.dadalink.core.data.assistant

import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import org.recitelabs.dadalink.core.domain.repository.AssistantRepository
import org.recitelabs.dadalink.core.domain.safety.EmergencyDetector
import org.recitelabs.dadalink.core.model.AppLanguage
import org.recitelabs.dadalink.core.model.AssistantEvent
import org.recitelabs.dadalink.core.model.ChatMessage
import org.recitelabs.dadalink.core.model.ChatRole
import org.recitelabs.dadalink.core.model.Country
import org.recitelabs.dadalink.core.model.JourneyPhase
import org.recitelabs.dadalink.core.model.SourceRef
import javax.inject.Inject

/**
 * Offline stand-in for the assistant backend: streams canned, safe answers in Amharic or English
 * (picked from the question's script, then the app language). No network, nothing stored.
 */
class FakeAssistant @Inject constructor(private val detector: EmergencyDetector) : AssistantRepository {

    var wordDelayMillis: Long = 35

    override suspend fun sendFeedback(helpful: Boolean, language: AppLanguage, contentIds: List<String>) = Unit

    override fun ask(conversation: List<ChatMessage>, language: AppLanguage, country: Country, phase: JourneyPhase): Flow<AssistantEvent> = flow {
        val question = conversation.lastOrNull { it.role == ChatRole.USER }?.text.orEmpty()
        val amharic = question.any { it in 'ሀ'..'፿' } || (question.isBlank() && language == AppLanguage.AMHARIC)
        val answer = pick(question.lowercase(), amharic, detector.isEmergency(question))
        if (answer.emergency) emit(AssistantEvent.EmergencyDetected)
        answer.text.split(" ").forEachIndexed { i, word ->
            delay(wordDelayMillis)
            emit(AssistantEvent.TextDelta(if (i == 0) word else " $word"))
        }
        emit(AssistantEvent.Sources(answer.sources))
        emit(AssistantEvent.FollowUps(answer.followUps))
    }

    private data class Canned(
        val text: String,
        val sources: List<SourceRef>,
        val followUps: List<String>,
        val emergency: Boolean = false,
    )

    private fun pick(q: String, am: Boolean, emergency: Boolean): Canned = when {
        emergency -> if (am) AM_EMERGENCY else EN_EMERGENCY
        listOf("passport", "iqama", "ፓስፖር", "ኢቃማ").any { it in q } -> if (am) AM_PASSPORT else EN_PASSPORT
        listOf("salary", "wage", "paid", "pay ", "money", "ደሞ", "ክፍያ", "ገንዘብ").any { it in q } -> if (am) AM_WAGES else EN_WAGES
        listOf("period", "pregnan", "late", "ወር አበባ", "እርግዝና", "ፀነስ").any { it in q } -> if (am) AM_PERIOD else EN_PERIOD
        listOf("sad", "alone", "lonely", "cry", "ብቸኝነት", "አዝኛለሁ", "ማልቀስ").any { it in q } -> if (am) AM_LOW else EN_LOW
        else -> if (am) AM_DEFAULT else EN_DEFAULT
    }

    private companion object {
        val RIGHTS = SourceRef("Your rights in Saudi Arabia (draft)", "DadaLink content team — pending expert review")
        val HEALTH = SourceRef("Stress and your period (draft)", "DadaLink health team — pending expert review")
        val WELLBEING = SourceRef("When you feel low (draft)", "DadaLink health team — pending expert review")

        val EN_EMERGENCY = Canned(
            "You may be in danger. If you can, press SOS now — it sends your location to your trusted contact. " +
                "You can also call the emergency number 911. Go to a safe room and keep your phone with you. I am here.",
            emptyList(), listOf("Show help numbers", "How do I leave safely?"), emergency = true,
        )
        val AM_EMERGENCY = Canned(
            "አደጋ ላይ ልትሆኚ ትችያለሽ። ከቻልሽ አሁን SOS ተጫኚ — ያለሽበትን ቦታ ለታማኝ ሰውሽ ይልካል። " +
                "እንዲሁም ወደ 911 መደወል ትችያለሽ። ወደ አስተማማኝ ክፍል ሂጂ እና ስልክሽን ያዢ። እዚህ ነኝ።",
            emptyList(), listOf("የእርዳታ ቁጥሮችን አሳዪኝ", "በሰላም እንዴት ልውጣ?"), emergency = true,
        )
        val EN_PASSPORT = Canned(
            "No. In Saudi Arabia your employer is not allowed to keep your passport or iqama without your agreement. " +
                "Write down the date it was taken in your private log. You can ask the labour ministry (19911) or your embassy for help.",
            listOf(RIGHTS), listOf("How do I report it?", "Call the embassy"),
        )
        val AM_PASSPORT = Canned(
            "አይ። በሳውዲ አረቢያ አሠሪሽ ያለ ፈቃድሽ ፓስፖርትሽን ወይም ኢቃማሽን መያዝ አይፈቀድለትም። " +
                "የተወሰደበትን ቀን በግል መዝገብሽ ጻፊ። የሠራተኛ ሚኒስቴርን (19911) ወይም ኤምባሲሽን እርዳታ መጠየቅ ትችያለሽ።",
            listOf(RIGHTS), listOf("እንዴት ሪፖርት አደርጋለሁ?", "ኤምባሲ ደውዪ"),
        )
        val EN_WAGES = Canned(
            "Your salary must be paid every month, in full, as written in your contract. Record each payment — and each missing one — " +
                "in My private log. Dates and amounts are strong evidence, even after you go home.",
            listOf(RIGHTS), listOf("Add a wage entry", "Who can help me get paid?"),
        )
        val AM_WAGES = Canned(
            "ደሞዝሽ በየወሩ ሙሉ በሙሉ በውልሽ መሠረት መከፈል አለበት። እያንዳንዱን ክፍያ — እና ያልተከፈለውን — " +
                "በግል መዝገብሽ መዝግቢ። ቀኖችና መጠኖች ወደ ቤት ከተመለስሽ በኋላም ጠንካራ ማስረጃ ናቸው።",
            listOf(RIGHTS), listOf("የደሞዝ መዝገብ ጨምሪ", "ደሞዜን ለማግኘት ማን ይረዳኛል?"),
        )
        val EN_PERIOD = Canned(
            "Stress, long hours and little sleep can make your period late by days or weeks — this is common. " +
                "If you might be pregnant, a test from a pharmacy is the first step. If you have strong pain or heavy bleeding, please see a clinic.",
            listOf(HEALTH), listOf("Pregnancy abroad: what are my options?", "Where is a clinic?"),
        )
        val AM_PERIOD = Canned(
            "ጭንቀት፣ ረጅም የሥራ ሰዓት እና እንቅልፍ ማጣት የወር አበባሽን በቀናት ወይም በሳምንታት ሊያዘገዩ ይችላሉ — ይህ የተለመደ ነው። " +
                "እርጉዝ ልትሆኚ እንደምትችዪ ካሰብሽ ከፋርማሲ ምርመራ መግዛት የመጀመሪያው እርምጃ ነው። ከባድ ሕመም ወይም ብዙ ደም ካለ ክሊኒክ ሂጂ።",
            listOf(HEALTH), listOf("በውጭ አገር እርግዝና፡ አማራጮቼ ምንድን ናቸው?", "ክሊኒክ የት አለ?"),
        )
        val EN_LOW = Canned(
            "I am sorry you feel this way. Many women far from home feel sad or alone — it is not your fault. " +
                "Small things can help: a short prayer, a few slow breaths, a message to someone you trust. If you think about hurting yourself, press SOS.",
            listOf(WELLBEING), listOf("Talk to someone now", "Check in with my trusted contact"),
        )
        val AM_LOW = Canned(
            "እንዲህ ስለተሰማሽ አዝናለሁ። ከቤት ርቀው ያሉ ብዙ ሴቶች ሀዘን ወይም ብቸኝነት ይሰማቸዋል — ያንቺ ጥፋት አይደለም። " +
                "ትናንሽ ነገሮች ሊረዱ ይችላሉ፡ አጭር ጸሎት፣ ቀስ ብሎ መተንፈስ፣ ለምታምኚው ሰው መልእክት። ራስሽን የመጉዳት ሐሳብ ካለሽ SOS ተጫኚ።",
            listOf(WELLBEING), listOf("አሁን ከአንድ ሰው ጋር ላውራ", "ለታማኝ ሰዌ ሰላም ነኝ ልበል"),
        )
        val EN_DEFAULT = Canned(
            "I can help with your rights at work, your health, and what to do if something goes wrong. " +
                "Ask me in your own words — for example about your salary, your passport, or your period.",
            emptyList(), listOf("Can my employer keep my passport?", "My salary is late", "My period is late"),
        )
        val AM_DEFAULT = Canned(
            "ስለ ሥራ መብቶችሽ፣ ስለ ጤናሽ እና ችግር ቢፈጠር ምን ማድረግ እንዳለብሽ ልረዳሽ እችላለሁ። " +
                "በራስሽ ቃላት ጠይቂኝ — ለምሳሌ ስለ ደሞዝሽ፣ ስለ ፓስፖርትሽ ወይም ስለ ወር አበባሽ።",
            emptyList(), listOf("አሠሪዬ ፓስፖርቴን መያዝ ይችላል?", "ደሞዜ ዘገየ", "የወር አበባዬ ዘገየ"),
        )
    }
}
