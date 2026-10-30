import type { EmergencyCategory } from "@dadalink/domain"

/**
 * Phrases that signal immediate danger, per category, across DadaLink's
 * languages. Matching is case-insensitive; Latin phrases must start at a word
 * boundary, Ethiopic phrases match anywhere (the script is agglutinative).
 * The list errs on the side of safety: a false alarm only adds one line
 * pointing to SOS. Non-English entries need native-speaker review.
 */
export const EMERGENCY_LEXICON: Readonly<Record<EmergencyCategory, ReadonlyArray<string>>> = {
  violence: [
    // en
    "beat me",
    "beats me",
    "beating me",
    "beaten",
    "hit me",
    "hits me",
    "hitting me",
    "kicked me",
    "slapped me",
    "burned me",
    "burns me",
    "rape",
    "raped",
    "sexually assaulted",
    "sexual assault",
    "abusing me",
    "abuses me",
    "locked me",
    "locks me",
    "locked in",
    "forced me",
    // am
    "ደበደበኝ",
    "ደበደቡኝ",
    "ይደበድበኛል",
    "ይደበድቡኛል",
    "ትደበድበኛለች",
    "መታኝ",
    "ይመታኛል",
    "ደፈረኝ",
    "ደፈሩኝ",
    "አስገድዶ",
    "ቆለፈብኝ",
    "ዘጋብኝ",
    // om
    "na rukute",
    "na rukuta",
    "na rukuti",
    "na reebe",
    "na reeba",
    "na reebdi",
    "na gudeede",
    "humnaan",
    "na cufe",
    // sw
    "ananipiga",
    "alinipiga",
    "wananipiga",
    "kunipiga",
    "alinibaka",
    "kunibaka",
    "amenifungia",
    // ti
    "ይወቕዓኒ",
    "ወቒዑኒ",
    "ደፊሩኒ",
    "ዓጽዩኒ"
  ],
  "threat-to-life": [
    // en
    "kill me",
    "will kill",
    "going to kill",
    "threatened to kill",
    "threatens to kill",
    "threatened me with",
    "strangle",
    "choked me",
    "chokes me",
    "my life is in danger",
    // am
    "ይገድለኛል",
    "ይገድሉኛል",
    "ትገድለኛለች",
    "እገድልሻለሁ",
    "ልገድልሽ",
    // om
    "na ajjeesa",
    "na ajjeefti",
    "si ajjeesa",
    "na ajjeesuu",
    // sw
    "ataniua",
    "wataniua",
    "kuniua",
    // ti
    "ክቐትለኒ",
    "ክቐትሉኒ",
    "ክትቐትለኒ"
  ],
  suicidal: [
    // en
    "suicide",
    "suicidal",
    "kill myself",
    "end my life",
    "take my life",
    "want to die",
    "don't want to live",
    "do not want to live",
    "no reason to live",
    "hurt myself",
    // am
    "ራሴን ማጥፋት",
    "ራሴን ላጥፋ",
    "ራሴን አጠፋለሁ",
    "ራሴን እገድላለሁ",
    "መሞት እፈልጋለሁ",
    "መኖር አልፈልግም",
    // om
    "of ajjeesuu",
    "of ajjeesa",
    "du'uun barbaada",
    "du'uu barbaada",
    "jiraachuu hin barbaadu",
    // sw
    "kujiua",
    "nataka kufa",
    "sitaki kuishi",
    // ti
    "ርእሰይ ክቐትል",
    "ክመውት ደልየ",
    "ክነብር ኣይደልን"
  ],
  medical: [
    // en
    "bleeding",
    "can't breathe",
    "cannot breathe",
    "unconscious",
    "fainted",
    "chest pain",
    "overdose",
    "poisoned",
    "seizure",
    "miscarriage",
    "labour pains",
    "labor pains",
    // am
    "ደም እየፈሰሰኝ",
    "ደም ይፈሰኛል",
    "መተንፈስ አልቻልኩም",
    "ራሴን ሳትኩ",
    "ጽንሴ ወረደ",
    "ምጥ",
    // om
    "dhiigni na dhangala'a",
    "hafuura baafachuu hin danda'u",
    "of wallaale",
    // sw
    "natoka damu",
    "siwezi kupumua",
    "nimezimia",
    "uchungu wa kujifungua",
    // ti
    "ደም ይፈሰኒ",
    "ክተንፍስ ኣይክእልን"
  ]
}
