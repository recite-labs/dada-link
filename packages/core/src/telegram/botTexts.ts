import type { Country, Locale } from "@dadalink/domain"

export interface BotTexts {
  readonly welcome: string
  readonly chooseLanguage: string
  readonly chooseCountry: string
  readonly menu: string
  readonly buttons: {
    readonly ask: string
    readonly help: string
    readonly rights: string
    readonly app: string
    readonly language: string
    readonly country: string
  }
  readonly askPrompt: string
  readonly helpTitle: string
  readonly numberPending: string
  readonly unverified: string
  readonly noHelpEntries: string
  readonly rightsTitle: string
  readonly noRights: string
  readonly rateLimited: string
  readonly unavailable: string
  readonly sosInfo: string
  readonly countries: Readonly<Record<Country, string>>
}

/**
 * Bot interface texts. English is the source; the other languages are
 * drafts that need native-speaker review before launch.
 */
export const BOT_TEXTS: Readonly<Record<Locale, BotTexts>> = {
  en: {
    welcome:
      "Hello, I am Dada, your sister in your pocket. I can answer questions about your rights, your health and your safety, before you go, while you are away and when you come home. I never ask for your name.",
    chooseLanguage: "Choose your language:",
    chooseCountry: "Which country are you in, or going to?",
    menu: "What do you need?",
    buttons: {
      ask: "Ask Dada",
      help: "Help numbers",
      rights: "My rights",
      app: "Get the app",
      language: "Language",
      country: "Country"
    },
    askPrompt: "Write your question in your own words. I answer only from information checked by our team.",
    helpTitle: "Help numbers",
    numberPending: "number not yet verified",
    unverified: "not yet verified",
    noHelpEntries: "I do not have help numbers for this country yet. Please contact your embassy.",
    rightsTitle: "Your rights",
    noRights: "I do not have reviewed information about rights in this country yet.",
    rateLimited:
      "You have asked many questions today. Please try again tomorrow. In an emergency, use the help numbers.",
    unavailable: "Sorry, I cannot answer right now. Please try again later. In an emergency, use the help numbers.",
    sosInfo:
      "In the DadaLink app, hold the SOS button to send your location to your trusted contact. If you are in danger now, call the emergency numbers.",
    countries: {
      SA: "Saudi Arabia",
      AE: "UAE",
      KW: "Kuwait",
      QA: "Qatar",
      LB: "Lebanon",
      JO: "Jordan",
      ET: "Ethiopia (home)"
    }
  },
  am: {
    welcome:
      "ሰላም፣ እኔ ዳዳ ነኝ፤ በኪስዎ ያለች እህትዎ። ከመሄድዎ በፊት፣ በውጭ ሀገር እያሉ እና ሲመለሱ ስለ መብትዎ፣ ስለ ጤናዎ እና ስለ ደህንነትዎ ጥያቄዎችን እመልሳለሁ። ስምዎን በፍጹም አልጠይቅም።",
    chooseLanguage: "ቋንቋዎን ይምረጡ፦",
    chooseCountry: "ያሉበት ወይም የሚሄዱበት ሀገር የትኛው ነው?",
    menu: "ምን ያስፈልግዎታል?",
    buttons: {
      ask: "ዳዳን ይጠይቁ",
      help: "የእርዳታ ስልኮች",
      rights: "መብቶቼ",
      app: "መተግበሪያውን ያውርዱ",
      language: "ቋንቋ",
      country: "ሀገር"
    },
    askPrompt: "ጥያቄዎን በራስዎ ቃላት ይጻፉ። የምመልሰው በቡድናችን ከተረጋገጠ መረጃ ብቻ ነው።",
    helpTitle: "የእርዳታ ስልኮች",
    numberPending: "ቁጥሩ ገና አልተረጋገጠም",
    unverified: "ገና አልተረጋገጠም",
    noHelpEntries: "ለዚህ ሀገር የእርዳታ ስልኮች ገና የሉኝም። እባክዎ ኤምባሲዎን ያነጋግሩ።",
    rightsTitle: "መብቶችዎ",
    noRights: "ስለዚህ ሀገር መብቶች የተገመገመ መረጃ ገና የለኝም።",
    rateLimited: "ዛሬ ብዙ ጥያቄዎችን ጠይቀዋል። እባክዎ ነገ እንደገና ይሞክሩ። በአደጋ ጊዜ የእርዳታ ስልኮችን ይጠቀሙ።",
    unavailable: "ይቅርታ፣ አሁን መመለስ አልቻልኩም። እባክዎ ቆይተው ይሞክሩ። በአደጋ ጊዜ የእርዳታ ስልኮችን ይጠቀሙ።",
    sosInfo: "በDadaLink መተግበሪያ ውስጥ የSOS ቁልፉን ተጭነው ይያዙ፤ ቦታዎ ለሚያምኑት ሰው ይላካል። አሁን አደጋ ላይ ከሆኑ የአደጋ ጊዜ ስልኮችን ይደውሉ።",
    countries: {
      SA: "ሳዑዲ ዓረቢያ",
      AE: "የተባበሩት ዓረብ ኤምሬትስ",
      KW: "ኩዌት",
      QA: "ኳታር",
      LB: "ሊባኖስ",
      JO: "ዮርዳኖስ",
      ET: "ኢትዮጵያ (ሀገር ቤት)"
    }
  },
  om: {
    welcome:
      "Akkam, ani Daadaa, obboleettii kee kiisii kee keessaati. Osoo hin deemin, alaa jirtuu fi yeroo deebitu waa'ee mirgaa, fayyaa fi nageenya keetii gaaffii siif deebisa. Maqaa kee gonkumaa hin gaafadhu.",
    chooseLanguage: "Afaan kee filadhu:",
    chooseCountry: "Biyya kamitti argamta, ykn deemta?",
    menu: "Maal si barbaachisa?",
    buttons: {
      ask: "Daadaa gaafadhu",
      help: "Lakkoofsa gargaarsaa",
      rights: "Mirga koo",
      app: "Appii argadhu",
      language: "Afaan",
      country: "Biyya"
    },
    askPrompt: "Gaaffii kee jechoota keetiin barreessi. Deebii kan kennu odeeffannoo garee keenyaan mirkanaa'e qofaan.",
    helpTitle: "Lakkoofsa gargaarsaa",
    numberPending: "lakkoofsi hin mirkanoofne",
    unverified: "hin mirkanoofne",
    noHelpEntries: "Biyya kanaaf lakkoofsa gargaarsaa hin qabu. Maaloo embaasii kee qunnami.",
    rightsTitle: "Mirga kee",
    noRights: "Waa'ee mirgaa biyya kanaa odeeffannoo sakatta'ame hin qabu.",
    rateLimited:
      "Har'a gaaffii baay'ee gaafatteetta. Maaloo boru irra deebi'ii yaali. Yeroo balaa lakkoofsa gargaarsaa fayyadami.",
    unavailable: "Dhiifama, amma deebisuu hin danda'u. Maaloo booda yaali. Yeroo balaa lakkoofsa gargaarsaa fayyadami.",
    sosInfo:
      "Appii DadaLink keessatti qabduu SOS qabadhu; bakki kee nama amanattuuf ni ergama. Amma balaa keessa yoo jirte, lakkoofsa balaa tasaa bilbili.",
    countries: {
      SA: "Saa'uudii Arabiyaa",
      AE: "Imireetota Arabaa",
      KW: "Kuweet",
      QA: "Qataar",
      LB: "Libaanos",
      JO: "Jordaan",
      ET: "Itoophiyaa (biyya)"
    }
  },
  sw: {
    welcome:
      "Habari, mimi ni Dada, dada yako mfukoni. Naweza kujibu maswali kuhusu haki zako, afya yako na usalama wako, kabla ya kuondoka, ukiwa nje na unaporudi nyumbani. Sitawahi kuuliza jina lako.",
    chooseLanguage: "Chagua lugha yako:",
    chooseCountry: "Uko nchi gani, au unaenda nchi gani?",
    menu: "Unahitaji nini?",
    buttons: {
      ask: "Muulize Dada",
      help: "Namba za msaada",
      rights: "Haki zangu",
      app: "Pata programu",
      language: "Lugha",
      country: "Nchi"
    },
    askPrompt: "Andika swali lako kwa maneno yako. Ninajibu tu kutoka kwa taarifa zilizothibitishwa na timu yetu.",
    helpTitle: "Namba za msaada",
    numberPending: "namba bado haijathibitishwa",
    unverified: "bado haijathibitishwa",
    noHelpEntries: "Bado sina namba za msaada za nchi hii. Tafadhali wasiliana na ubalozi wako.",
    rightsTitle: "Haki zako",
    noRights: "Bado sina taarifa iliyokaguliwa kuhusu haki katika nchi hii.",
    rateLimited: "Umeuliza maswali mengi leo. Tafadhali jaribu tena kesho. Katika dharura, tumia namba za msaada.",
    unavailable: "Samahani, siwezi kujibu sasa. Tafadhali jaribu baadaye. Katika dharura, tumia namba za msaada.",
    sosInfo:
      "Katika programu ya DadaLink, shikilia kitufe cha SOS ili kutuma mahali ulipo kwa mtu unayemwamini. Ikiwa uko hatarini sasa, piga namba za dharura.",
    countries: {
      SA: "Saudi Arabia",
      AE: "Falme za Kiarabu",
      KW: "Kuwait",
      QA: "Qatar",
      LB: "Lebanon",
      JO: "Jordan",
      ET: "Ethiopia (nyumbani)"
    }
  },
  ti: {
    welcome:
      "ሰላም፣ ኣነ ዳዳ እየ፣ ኣብ ጅባኺ ዘላ ሓብትኺ። ቅድሚ ምኻድኪ፣ ኣብ ወጻኢ ከለኺ ከምኡ'ውን ምስ ተመለስኪ ብዛዕባ መሰልኪ፣ ጥዕናኺ ከምኡ'ውን ድሕነትኪ ሕቶታት እምልስ። ስምኪ ፈጺመ ኣይሓትትን።",
    chooseLanguage: "ቋንቋኺ ምረጺ፦",
    chooseCountry: "ኣብ ኣየናይ ሃገር ኣለኺ፣ ወይ ትኸዲ?",
    menu: "እንታይ የድልየኪ?",
    buttons: {
      ask: "ንዳዳ ሕተቲ",
      help: "ቁጽሪ ሓገዝ",
      rights: "መሰላተይ",
      app: "ኣፕ ረኸቢ",
      language: "ቋንቋ",
      country: "ሃገር"
    },
    askPrompt: "ሕቶኺ ብቓላትኪ ጽሓፊ። መልሲ ዝህብ ካብቲ ብጉጅለና ዝተረጋገጸ ሓበሬታ ጥራይ እዩ።",
    helpTitle: "ቁጽሪ ሓገዝ",
    numberPending: "ቁጽሪ ገና ኣይተረጋገጸን",
    unverified: "ገና ኣይተረጋገጸን",
    noHelpEntries: "ን እዛ ሃገር ቁጽሪ ሓገዝ ገና የብለይን። በጃኺ ንኤምባሲኺ ተወከሲ።",
    rightsTitle: "መሰላትኪ",
    noRights: "ብዛዕባ መሰላት ኣብ እዛ ሃገር ዝተገምገመ ሓበሬታ ገና የብለይን።",
    rateLimited: "ሎሚ ብዙሕ ሕቶታት ሓቲትኪ። በጃኺ ጽባሕ እንደገና ፈትኒ። ኣብ ህጹጽ እዋን ቁጽሪ ሓገዝ ተጠቐሚ።",
    unavailable: "ይቕሬታ፣ ሕጂ ክምልስ ኣይክእልን። በጃኺ ጸኒሕኪ ፈትኒ። ኣብ ህጹጽ እዋን ቁጽሪ ሓገዝ ተጠቐሚ።",
    sosInfo: "ኣብ DadaLink ኣፕ፣ ናይ SOS መጠወቒ ጠዊቕኪ ሓዝዮ፤ ቦታኺ ናብቲ እትኣምንዮ ሰብ ክለኣኽ እዩ። ሕጂ ኣብ ሓደጋ እንተሃሊኺ ቁጽሪ ህጹጽ ረድኤት ደውሊ።",
    countries: {
      SA: "ሳዑዲ ዓረብ",
      AE: "ሕቡራት ኢማራት ዓረብ",
      KW: "ኩዌት",
      QA: "ቐጠር",
      LB: "ሊባኖስ",
      JO: "ዮርዳኖስ",
      ET: "ኢትዮጵያ (ዓዲ)"
    }
  }
}

/** Language names shown on the language picker, each in its own language. */
export const LANGUAGE_LABELS: Readonly<Record<Locale, string>> = {
  am: "አማርኛ",
  om: "Afaan Oromoo",
  en: "English",
  sw: "Kiswahili",
  ti: "ትግርኛ"
}
