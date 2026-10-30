import type { Messages } from "./en.ts"

/**
 * Amharic UI strings.
 * DRAFT (machine-assisted): awaiting review by a native speaker before launch.
 */
export const am: Messages = {
  meta: {
    languageName: "አማርኛ",
    shortLabel: "አማ",
    status: "draft-ai"
  },
  common: {
    appName: "DadaLink",
    tagline: "በኪስዎ ያለች እህት",
    loading: "በመጫን ላይ…",
    retry: "እንደገና ይሞክሩ",
    close: "ዝጋ",
    call: "ደውል",
    copy: "ቅዳ",
    copied: "ተቀድቷል",
    notVerified: "ገና አልተረጋገጠም",
    opensInNewTab: "(በአዲስ ገጽ ይከፈታል)"
  },
  nav: {
    main: "ዋና",
    home: "መነሻ",
    ask: "ጠይቁ",
    sos: "SOS",
    help: "እርዳታ",
    about: "ስለ እኛ",
    language: "ቋንቋ",
    homeLink: "የDadaLink መነሻ ገጽ"
  },
  hide: {
    label: "ደብቅ",
    description: "ይህን ገጽ አሁኑኑ ትተው የአየር ሁኔታ ገጽ ይክፈቱ"
  },
  countries: {
    SA: "ሳዑዲ ዓረቢያ",
    AE: "የተባበሩት ዓረብ ኤሚሬቶች",
    KW: "ኩዌት",
    QA: "ኳታር",
    LB: "ሊባኖስ",
    JO: "ዮርዳኖስ",
    ET: "ኢትዮጵያ"
  },
  countriesShort: {
    SA: "ሳዑዲ ዓረቢያ",
    AE: "ዱባይ (UAE)",
    KW: "ኩዌት",
    QA: "ኳታር",
    LB: "ሊባኖስ",
    JO: "ዮርዳኖስ",
    ET: "ኢትዮጵያ"
  },
  phases: {
    before: "ከመሄድ በፊት",
    abroad: "በውጭ",
    return: "ስመለስ"
  },
  phaseTitles: {
    before: "ከመሄድዎ በፊት",
    abroad: "በውጭ ሀገር ሳሉ",
    return: "ወደ ሀገር ቤት ሲመለሱ"
  },
  home: {
    greeting: "ሰላም እህቴ።",
    question: "ዛሬ በምን እንርዳዎት?",
    journeyLabel: "ጉዞዎ የት ደረጃ ላይ ነው?",
    countryLabel: {
      before: "ወዴት ነው የሚሄዱት?",
      abroad: "አሁን የት ነዎት?",
      return: "አሁን የት ነዎት?"
    },
    askTitle: "ዳዳን ይጠይቁ",
    askBody: "ጤና፣ መብትዎ፣ ውልዎ — ማንኛውንም ነገር በሚስጥር ይጠይቁ።",
    askPlaceholder: "ጥያቄዎን ይጻፉ…",
    askSubmit: "ጠይቅ",
    tiles: {
      help: { title: "የእርዳታ ስልኮች", body: "ኤምባሲ፣ የስልክ መስመሮች፣ IOM" },
      rights: { title: "መብቶቼ", body: "ውል፣ ደመወዝ፣ ፓስፖርት" },
      journey: { title: "የጉዞ መመሪያዎች", body: "ማወቅ ያለብዎት፣ ደረጃ በደረጃ" },
      agencies: { title: "ኤጀንሲዬ ፈቃድ አለው?", body: "ከመክፈልዎ በፊት ያረጋግጡ" }
    },
    emergencyTitle: "አሁን አደጋ ላይ ነዎት?",
    emergencyBody: (country: string) => `በ${country} የአደጋ ጊዜ ስልኮች`,
    emergencyAction: "ቁጥሮቹን አሳይ"
  },
  emergency: {
    title: "አሁኑኑ ለእርዳታ ይደውሉ",
    subtitle: (country: string) => `በ${country} የአደጋ ጊዜ ስልኮች`,
    noNumbers: "ቁጥሮቹን መጫን አልቻልንም። ለፖሊስ ወይም ለኤምባሲዎ ይደውሉ።",
    webNote: "ይህ ድረ-ገጽ የSOS መልእክት መላክ አይችልም። የDadaLink መተግበሪያ ግን ያለ ኢንተርኔትም ቢሆን ለሚያምኑት ሰው በSMS ማሳወቅ ይችላል።",
    getApp: "መተግበሪያውን ያውርዱ",
    allNumbers: "ሁሉም የእርዳታ ስልኮች",
    callNumber: (name: string, number: string) => `ወደ ${name} ይደውሉ፦ ${number}`
  },
  ask: {
    title: "ዳዳን ይጠይቁ",
    subtitle: "የተገመገሙ መልሶች · በሚስጥር",
    emptyTitle: "ምን ማወቅ ይፈልጋሉ?",
    emptyBody: "ዳዳ የሚመልሰው ቡድናችን ካረጋገጠው መረጃ ብቻ ነው። የሚጽፉት ምንም ነገር አይቀመጥም።",
    suggestions: ["አሰሪዬ ፓስፖርቴን ወሰደብኝ", "ደመወዜ አልተከፈለኝም", "በጣም ብቸኝነት ይሰማኛል"],
    placeholder: "ጥያቄዎን ይጻፉ…",
    send: "ላክ",
    disclaimer: "ዳዳ መረጃ ትሰጣለች እንጂ የሕግ ወይም የሕክምና ምክር አይደለም። አደጋ ላይ ነዎት?",
    disclaimerSos: "SOS ይጫኑ።",
    you: "እርስዎ",
    dada: "ዳዳ",
    thinking: "ዳዳ መልስ እየፈለገች ነው…",
    sources: "ምንጮች",
    emergencyTitle: "መጀመሪያ ደህንነትዎ",
    quotaTitle: "የዛሬ ጥያቄዎችዎን ጨርሰዋል",
    quotaBody: "ዳዳ ለሁሉም ነጻ እንድትሆን የቀን ገደብ አለ። ነገ እንደገና መጠየቅ ይችላሉ። የእርዳታ ስልኮች እና መመሪያዎች ሁልጊዜ ክፍት ናቸው።",
    errorUnavailable: "ዳዳ አሁን መመለስ አልቻለችም። እባክዎ ትንሽ ቆይተው እንደገና ይሞክሩ።",
    errorNetwork: "ግንኙነት የለም። ኢንተርኔትዎን አረጋግጠው እንደገና ይሞክሩ።",
    errorInvalid: "እባክዎ አጠር ያለ ጥያቄ ይጻፉ።",
    stopped: "ቆሟል።"
  },
  help: {
    title: "የእርዳታ ስልኮች",
    countryLabel: "ሀገር",
    emergencyHeading: "አደጋ ጊዜ",
    groups: {
      emergency: "አደጋ ጊዜ",
      missions: "የኢትዮጵያ ሚሲዮኖች",
      work: "ሥራ እና ጥበቃ",
      support: "መጠለያ እና ድጋፍ",
      health: "ጤና",
      return: "ለተመላሾች አገልግሎት",
      other: "ሌሎች አገልግሎቶች"
    },
    noNumber: "እስካሁን ይፋዊ ቁጥር የለም",
    website: "ድረ-ገጽ",
    whatsapp: "WhatsApp",
    email: "ኢሜይል",
    hours: "ሰዓት",
    details: "ዝርዝር (በእንግሊዝኛ)",
    copyNumber: (name: string) => `የ${name}ን ቁጥር ቅዳ`,
    callNumber: (name: string) => `ወደ ${name} ደውል`,
    empty: "ለዚህ ሀገር እስካሁን የእርዳታ ስልኮች የሉንም።",
    source: "ምንጭ",
    unverifiedNote: "ቁጥሮቹ ከይፋዊ ምንጮች የተወሰዱ ናቸው። “ገና አልተረጋገጠም” የተባሉት በቡድናችን ገና አልተደወለላቸውም።"
  },
  topics: {
    emergency: "አደጋ ጊዜ",
    abuse: "በደል",
    "sexual-violence": "ጾታዊ ጥቃት",
    wages: "ደመወዝ",
    passport: "ፓስፖርት",
    documents: "ሰነዶች",
    "labour-complaint": "የሥራ አቤቱታ",
    shelter: "መጠለያ",
    repatriation: "ወደ ሀገር መመለስ",
    legal: "የሕግ እርዳታ",
    health: "ጤና",
    "mental-health": "የአእምሮ ጤና",
    trafficking: "ሕገ-ወጥ የሰዎች ዝውውር",
    detention: "እስር",
    "returnee-support": "ለተመላሾች ድጋፍ",
    fire: "እሳት",
    srh: "የሥነ-ተዋልዶ ጤና",
    rights: "መብቶች",
    money: "ገንዘብ",
    agencies: "ኤጀንሲዎች",
    safety: "ደህንነት",
    return: "መመለስ"
  },
  content: {
    sensitiveTitle: "ማሳሰቢያ",
    sensitiveBody: "ይህ ገጽ ስለ ጥቃት ወይም ሌሎች ከባድ ገጠመኞች ይናገራል። ዝግጁ ሲሆኑ ያንብቡት። አደጋ ላይ ከሆኑ SOS ይጫኑ።",
    fallbackLanguage: "ይህ ገጽ ገና ወደ ቋንቋዎ ስላልተተረጎመ በእንግሊዝኛ ቀርቧል።",
    draft: "ረቂቅ፦ ገና በባለሙያ አልተገመገመም።",
    sources: "ምንጮች",
    accessed: (date: string) => `የተነበበው ${date}`,
    updated: (date: string) => `የተሻሻለው ${date}`,
    askAbout: "ስለዚህ ዳዳን ይጠይቁ",
    notFound: "ይህን ገጽ ማግኘት አልቻልንም።"
  },
  rights: {
    eyebrow: "መብቶችዎ",
    chooseCountry: "ሀገር ይምረጡ"
  },
  journey: {
    eyebrow: "የጉዞ መመሪያዎች",
    empty: "ለዚህ የጉዞ ክፍል እስካሁን መመሪያ የለም።",
    sensitive: "ማሳሰቢያ"
  },
  agencies: {
    title: "ኤጀንሲዬ ፈቃድ አለው?",
    intro: "ማንኛውንም ክፍያ ከመክፈልዎ ወይም ፓስፖርትዎን ከመስጠትዎ በፊት ያረጋግጡ።",
    label: "የኤጀንሲው ስም ወይም የፈቃድ ቁጥር",
    placeholder: "የኤጀንሲው ስም ወይም የፈቃድ ቁጥር",
    submit: "አረጋግጥ",
    hint: "በኢትዮጵያ ፈቃድ ካላቸው ኤጀንሲዎች ይፋዊ ዝርዝር ጋር ይመሳከራል።",
    licence: (number: string) => `የፈቃድ ቁጥር ${number}`,
    verdicts: {
      licensed: {
        title: "ፈቃድ አለው",
        body: "ፈቃድ ያለው ኤጀንሲ የቅጥር ክፍያ ሊያስከፍልዎ አይገባም። እያንዳንዱን ደረሰኝ ያስቀምጡ።"
      },
      suspended: {
        title: "ፈቃዱ ታግዷል",
        body: "ይህ ኤጀንሲ አሁን ሠራተኛ መመልመል አይችልም። ምንም ክፍያ አይክፈሉ።"
      },
      revoked: {
        title: "ፈቃዱ ተሰርዟል",
        body: "ይህ ኤጀንሲ ሠራተኛ እንዲመለምል አይፈቀድለትም። ምንም ክፍያ አይክፈሉ፤ ፓስፖርትዎንም አይስጡ።"
      },
      unknown: {
        title: "ሁኔታው ግልጽ አይደለም",
        body: "የዚህን ኤጀንሲ ፈቃድ ማረጋገጥ አልቻልንም። ከመክፈልዎ በፊት የሥራና ክህሎት ሚኒስቴርን ይጠይቁ።"
      },
      notFound: {
        title: "አልተገኘም",
        body: "ምንም ክፍያ አይክፈሉ። ይህ ስም እኛ ባለን የፈቃድ ዝርዝር ውስጥ የለም። ሕገ-ወጥ ደላላ ሊሆን ይችላል — ወይም ዝርዝሩ ያልተሟላ ሊሆን ስለሚችል የሥራና ክህሎት ሚኒስቴርን ያረጋግጡ።",
        report: "ሪፖርት ያድርጉ",
        ask: "ዳዳን ይጠይቁ"
      }
    },
    spotBroker: "ሕገ-ወጥ ደላላን እንዴት መለየት ይቻላል"
  },
  about: {
    title: "ስለ DadaLink",
    intro:
      "DadaLink ወደ ባሕረ ሰላጤው ሀገራት እና ሊባኖስ በቤት ሠራተኝነት ለሚሄዱ አፍሪካውያን ሴቶች ደህንነትን የሚያስቀድም አጋር ነው — ከመሄዳቸው በፊት፣ በውጭ ሳሉ እና ወደ ሀገር ቤት ሲመለሱ።",
    whatTitle: "DadaLink ምን ያደርጋል",
    whatBody: "ለእያንዳንዱ ሀገር የእርዳታ ስልኮች፣ መብቶችዎ፣ የጉዞ መመሪያዎች፣ የቅጥር ኤጀንሲ ማረጋገጫ፣ እና ዳዳ፦ ቡድናችን ከገመገመው መረጃ ብቻ የምትመልስ ረዳት።",
    channelsBody:
      "DadaLink በቴሌግራም እና በAndroid መተግበሪያም ይሠራል። መተግበሪያው ለሚያምኑት ሰው የSOS ማሳወቂያ፣ የግል ማስታወሻ እና የመደበቂያ ዘዴ ይጨምራል።",
    privacyTitle: "የግላዊነት ቃላችን",
    privacyItems: [
      "መለያ የለም፣ ስም የለም፣ ስልክ ቁጥር የለም።",
      "ምንም ዓይነት ክትትል፣ ማስታወቂያ ወይም መከታተያ የለም። ፊደላቱም ከDadaLink ራሱ ይመጣሉ።",
      "ለዳዳ የሚጠይቁት ጥያቄ አይቀመጥም። በዚህ ስልክ ላይ ያለ የዘፈቀደ ቁጥር የዕለት ጥያቄዎችዎን ብቻ ይቆጥራል።",
      "ይህ አሳሽ የሚያስታውሰው ቋንቋዎን፣ ሀገርዎን እና የጉዞ ደረጃዎን ብቻ ነው።",
      "“ደብቅ” ገጹን ወዲያውኑ ይዘጋል። የአሳሽዎን ታሪክ ግን ማጥፋት አይችልም፤ ስልክዎን የሚፈትሽ ሰው ካለ የግል መስኮት (private window) ይጠቀሙ።"
    ],
    whoTitle: "እኛ ማን ነን",
    whoBody:
      "DadaLink በአዲስ አበባ፣ ኢትዮጵያ የሚገኘው Recite Labs በውጭ ሀገር ከሠሩ ሴቶች ጋር በመሆን የሠራው ነው። ዳዳ ከመጠቀሟ በፊት ይዘቱ በባለሙያዎች ይገመገማል።",
    openSourceTitle: "ክፍት ምንጭ",
    openSourceBody: "DadaLink በGNU AGPL-3.0 ፈቃድ ስር ያለ ነጻ ሶፍትዌር ነው። የመጀመሪያው ስሪት ሲዘጋጅ ኮዱ ይፋ ይደረጋል።",
    translationsTitle: "ትርጉሞች",
    translationsBody: "ምንጩ እንግሊዝኛ ነው። የአማርኛ እና የአፋን ኦሮሞ ጽሑፎች ረቂቅ ሲሆኑ በአፍ መፍቻ ቋንቋ ተናጋሪዎች እየተገመገሙ ነው።"
  },
  errors: {
    title: "የሆነ ችግር ተፈጥሯል",
    body: "እባክዎ እንደገና ይሞክሩ። አደጋ ላይ ከሆኑ የአደጋ ጊዜ ስልኮችን ይጠቀሙ።",
    notFoundTitle: "ገጹ አልተገኘም",
    notFoundBody: "ይህ ገጽ የለም ወይም ተዛውሯል።",
    goHome: "ወደ መነሻ ይሂዱ",
    offline: "ግንኙነት የለም። ኢንተርኔትዎን አረጋግጠው እንደገና ይሞክሩ።"
  },
  footer: {
    madeBy: "በRecite Labs፣ አዲስ አበባ የተሠራ",
    draftNotice: "ይህ ትርጉም ረቂቅ ሲሆን ግምገማ እየጠበቀ ነው።"
  }
}
