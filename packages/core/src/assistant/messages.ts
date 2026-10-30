import type { Locale } from "@dadalink/domain"

/**
 * Fixed, localised assistant texts that must not depend on the model.
 * English is the source; other languages are drafts awaiting native-speaker
 * review (see docs/content-format.md, "Assistant fixed texts").
 */
export interface AssistantMessages {
  /** Shown when no reviewed content matches the question. */
  readonly fallback: string
  /** First line when danger is detected; `{numbers}` is replaced by local numbers. */
  readonly emergencyWithNumbers: string
  /** First line when danger is detected but no local numbers are known. */
  readonly emergencyGeneric: string
  /** Prefixed to the emergency line for suicidal thoughts. */
  readonly notAlone: string
}

export const MESSAGES: Readonly<Record<Locale, AssistantMessages>> = {
  en: {
    fallback:
      "I'm sorry, I don't have reviewed information about this yet. I can only answer from content checked by our team. Please look at the help numbers for your country, or contact your embassy or an organisation you trust.",
    emergencyWithNumbers:
      "If you are in danger right now, press SOS in DadaLink to alert your trusted contact, and call: {numbers}.",
    emergencyGeneric:
      "If you are in danger right now, press SOS in DadaLink to alert your trusted contact, and call your local emergency number.",
    notAlone: "You are not alone."
  },
  am: {
    fallback:
      "ይቅርታ፣ ስለዚህ ጉዳይ እስካሁን የተገመገመ መረጃ የለኝም። መልስ የምሰጠው በቡድናችን ከተረጋገጠ መረጃ ብቻ ነው። እባክዎ ባሉበት ሀገር ያሉትን የእርዳታ ስልክ ቁጥሮች ይመልከቱ፣ ወይም ኤምባሲዎን ወይም የሚያምኑትን ድርጅት ያነጋግሩ።",
    emergencyWithNumbers: "አሁን አደጋ ላይ ከሆኑ፣ የሚያምኑት ሰው እንዲያውቅ በDadaLink ውስጥ SOS ይጫኑ፤ እና ይደውሉ፦ {numbers}።",
    emergencyGeneric: "አሁን አደጋ ላይ ከሆኑ፣ የሚያምኑት ሰው እንዲያውቅ በDadaLink ውስጥ SOS ይጫኑ፤ እና የአካባቢውን የአደጋ ጊዜ ስልክ ይደውሉ።",
    notAlone: "ብቻዎን አይደሉም።"
  },
  om: {
    fallback:
      "Dhiifama, waa'ee kanaa odeeffannoo sakatta'ame hanga ammaatti hin qabu. Deebii kan kennu odeeffannoo garee keenyaan mirkanaa'e qofaan. Maaloo lakkoofsa bilbilaa gargaarsaa biyya jirtanii ilaalaa, yookaan embaasii keessan ykn dhaabbata amanattan qunnamaa.",
    emergencyWithNumbers:
      "Amma balaa keessa yoo jirtan, akka namni amanattan beeku DadaLink keessatti SOS tuqaa, akkasumas bilbilaa: {numbers}.",
    emergencyGeneric:
      "Amma balaa keessa yoo jirtan, akka namni amanattan beeku DadaLink keessatti SOS tuqaa, akkasumas lakkoofsa balaa tasaa naannoo keessanii bilbilaa.",
    notAlone: "Isin qofa miti."
  },
  sw: {
    fallback:
      "Samahani, bado sina taarifa iliyokaguliwa kuhusu jambo hili. Ninajibu tu kutoka kwa maudhui yaliyothibitishwa na timu yetu. Tafadhali angalia namba za msaada za nchi uliyopo, au wasiliana na ubalozi wako au shirika unaloliamini.",
    emergencyWithNumbers:
      "Ikiwa uko hatarini sasa hivi, bonyeza SOS kwenye DadaLink ili kumjulisha mtu unayemwamini, na piga simu: {numbers}.",
    emergencyGeneric:
      "Ikiwa uko hatarini sasa hivi, bonyeza SOS kwenye DadaLink ili kumjulisha mtu unayemwamini, na piga namba ya dharura ya eneo lako.",
    notAlone: "Hauko peke yako."
  },
  ti: {
    fallback:
      "ይቕሬታ፣ ብዛዕባ እዚ ጉዳይ ክሳብ ሕጂ ዝተገምገመ ሓበሬታ የብለይን። መልሲ ዝህብ ካብቲ ብጉጅለና ዝተረጋገጸ ሓበሬታ ጥራይ እዩ። በጃኹም ኣብ ዘለኹምዋ ሃገር ዘለዉ ቁጽሪ ተሌፎን ሓገዝ ርኣዩ፣ ወይ ንኤምባሲኹም ወይ ንእትኣምንዎ ትካል ተወከሱ።",
    emergencyWithNumbers: "ሕጂ ኣብ ሓደጋ እንተሃሊኹም፣ እቲ እትኣምንዎ ሰብ ምእንቲ ክፈልጥ ኣብ DadaLink SOS ጠውቑ፤ ከምኡ'ውን ደውሉ፦ {numbers}።",
    emergencyGeneric:
      "ሕጂ ኣብ ሓደጋ እንተሃሊኹም፣ እቲ እትኣምንዎ ሰብ ምእንቲ ክፈልጥ ኣብ DadaLink SOS ጠውቑ፤ ከምኡ'ውን ናይ ከባቢኹም ቁጽሪ ህጹጽ ረድኤት ደውሉ።",
    notAlone: "በይንኹም ኣይኮንኩምን።"
  }
}
