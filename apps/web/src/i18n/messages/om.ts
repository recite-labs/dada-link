import type { Messages } from "./en.ts"

/**
 * Afaan Oromo UI strings.
 * DRAFT (machine-assisted): awaiting review by a native speaker before launch.
 */
export const om: Messages = {
  meta: {
    languageName: "Afaan Oromoo",
    shortLabel: "OM",
    status: "draft-ai"
  },
  common: {
    appName: "DadaLink",
    tagline: "Obboleettii kiisii kee keessa jirtu",
    loading: "Fe'amaa jira…",
    retry: "Irra deebi'ii yaali",
    close: "Cufi",
    call: "Bilbili",
    copy: "Garagalchi",
    copied: "Garagalfameera",
    notVerified: "ammallee hin mirkanoofne",
    opensInNewTab: "(fuula haaraa keessatti bana)"
  },
  nav: {
    main: "Ijoo",
    home: "Mana",
    ask: "Gaafadhu",
    sos: "SOS",
    help: "Gargaarsa",
    about: "Waa'ee keenya",
    language: "Afaan",
    homeLink: "Fuula jalqabaa DadaLink"
  },
  hide: {
    label: "Dhoksi",
    description: "Marsariitii kana amma dhiisii fuula haala qilleensaa bani"
  },
  countries: {
    SA: "Saawudii Arabiyaa",
    AE: "Imireetota Arabaa Tokkoomaniin",
    KW: "Kuweet",
    QA: "Kaatar",
    LB: "Libaanos",
    JO: "Jordaan",
    ET: "Itoophiyaa"
  },
  countriesShort: {
    SA: "Saawudii Arabiyaa",
    AE: "UAE (Dubaay)",
    KW: "Kuweet",
    QA: "Kaatar",
    LB: "Libaanos",
    JO: "Jordaan",
    ET: "Itoophiyaa"
  },
  phases: {
    before: "Dura",
    abroad: "Alaa",
    return: "Deebii"
  },
  phaseTitles: {
    before: "Osoo hin deemin dura",
    abroad: "Yeroo biyya alaa jirtan",
    return: "Yeroo manatti deebitan"
  },
  home: {
    greeting: "Akkam, obboleettii.",
    question: "Har'a maaliin isin gargaarru?",
    journeyLabel: "Imala keessan keessatti eessa jirtu?",
    countryLabel: {
      before: "Eessa deemtu?",
      abroad: "Amma eessa jirtu?",
      return: "Amma eessa jirtu?"
    },
    askTitle: "Daadaa gaafadhaa",
    askBody: "Fayyaa, mirgoota keessan, waliigaltee keessan — waan barbaaddan dhoksaan gaafadhaa.",
    askPlaceholder: "Gaaffii keessan barreessaa…",
    askSubmit: "Gaafadhu",
    tiles: {
      help: { title: "Lakkoofsota gargaarsaa", body: "Embaasii, sarara bilbilaa, IOM" },
      rights: { title: "Mirgoota koo", body: "Waliigaltee, mindaa, paaspoortii" },
      journey: { title: "Qajeelfama imalaa", body: "Waan beekuu qabdan, tarkaanfiin" },
      agencies: { title: "Ejansiin koo hayyama qabaa?", body: "Osoo hin kaffalin dura mirkaneessaa" }
    },
    emergencyTitle: "Amma balaa keessa jirtuu?",
    emergencyBody: (country: string) => `Lakkoofsota balaa tasaa ${country}`,
    emergencyAction: "Lakkoofsota agarsiisi"
  },
  emergency: {
    title: "Amma gargaarsaaf bilbilaa",
    subtitle: (country: string) => `Lakkoofsota balaa tasaa ${country} keessatti`,
    noNumbers: "Lakkoofsota fe'uu hin dandeenye. Poolisii ykn embaasii keessan bilbilaa.",
    webNote:
      "Marsariitiin kun ergaa SOS erguu hin danda'u. Appiin DadaLink garuu interneetii malee illee nama amanattan SMS'n beeksisuu danda'a.",
    getApp: "Appii buufadhaa",
    allNumbers: "Lakkoofsota gargaarsaa hunda",
    callNumber: (name: string, number: string) => `${name} bilbilaa: ${number}`
  },
  ask: {
    title: "Daadaa gaafadhaa",
    subtitle: "Deebii sakatta'ame · dhuunfaa",
    emptyTitle: "Maal beekuu barbaaddu?",
    emptyBody:
      "Daadaan odeeffannoo garee keenyaan mirkanaa'e qofaan deebisti. Wanti isin barreessitan tokkollee hin kuufamu.",
    suggestions: ["Hojjechiisaan koo paaspoortii koo fudhate", "Mindaan koo hin kaffalamne", "Baay'een kophaa na taha"],
    placeholder: "Gaaffii keessan barreessaa…",
    send: "Ergi",
    disclaimer: "Daadaan odeeffannoo kenniti, gorsa seeraa ykn fayyaa miti. Balaa keessa jirtuu?",
    disclaimerSos: "SOS tuqaa.",
    you: "Isin",
    dada: "Daadaa",
    thinking: "Daadaan deebii barbaaddaa jirti…",
    sources: "Madda",
    emergencyTitle: "Nageenyi keessan dursa",
    quotaTitle: "Gaaffilee har'aa xumurtaniittu",
    quotaBody:
      "Daadaan nama hundaaf bilisa akka taatuuf daangaan guyyaa jira. Boru irra deebitanii gaafachuu dandeessu. Lakkoofsonni gargaarsaa fi qajeelfamni yeroo hunda banaa dha.",
    errorUnavailable: "Daadaan amma deebisuu hin dandeenye. Maaloo yeroo muraasa booda irra deebi'aa yaalaa.",
    errorNetwork: "Walqunnamtiin hin jiru. Interneetii keessan mirkaneeffadhaatii irra deebi'aa yaalaa.",
    errorInvalid: "Maaloo gaaffii gabaabaa barreessaa.",
    stopped: "Dhaabbateera."
  },
  help: {
    title: "Lakkoofsota gargaarsaa",
    countryLabel: "Biyya",
    emergencyHeading: "Balaa tasaa",
    groups: {
      emergency: "Balaa tasaa",
      missions: "Bakka bu'ummaa Itoophiyaa",
      work: "Hojii fi eegumsa",
      support: "Iddoo boqonnaa fi deeggarsa",
      health: "Fayyaa",
      return: "Tajaajila deebi'ootaa",
      other: "Tajaajiloota biroo"
    },
    noNumber: "Ammaaf lakkoofsi ifa ta'e hin jiru",
    website: "Marsariitii",
    whatsapp: "WhatsApp",
    email: "Imeelii",
    hours: "Sa'aatii",
    details: "Bal'ina (Afaan Ingiliffaan)",
    copyNumber: (name: string) => `Lakkoofsa ${name} garagalchi`,
    callNumber: (name: string) => `${name} bilbili`,
    empty: "Biyya kanaaf ammaaf lakkoofsota gargaarsaa hin qabnu.",
    source: "Madda",
    unverifiedNote:
      "Lakkoofsonni madda mootummaa ifa ta'e irraa fudhataman. Kanneen “ammallee hin mirkanoofne” jedhaman garee keenyaan ammallee hin bilbilamne."
  },
  topics: {
    emergency: "balaa tasaa",
    abuse: "miidhaa",
    "sexual-violence": "miidhaa saalaa",
    wages: "mindaa",
    passport: "paaspoortii",
    documents: "sanadoota",
    "labour-complaint": "komii hojii",
    shelter: "iddoo boqonnaa",
    repatriation: "biyyatti deebi'uu",
    legal: "gargaarsa seeraa",
    health: "fayyaa",
    "mental-health": "fayyaa sammuu",
    trafficking: "daldala namaa",
    detention: "hidhaa",
    "returnee-support": "deeggarsa deebi'ootaa",
    fire: "ibidda",
    srh: "fayyaa saalaa fi wal-hormaataa",
    rights: "mirgoota",
    money: "maallaqa",
    agencies: "ejansiiwwan",
    safety: "nageenya",
    return: "deebi'uu"
  },
  content: {
    sensitiveTitle: "Hubachiisa",
    sensitiveBody:
      "Fuulli kun waa'ee miidhaa ykn muuxannoo dhukkubbii qabu kan biroo dubbata. Yeroo qophoofte dubbisi. Balaa keessa yoo jirte, SOS tuqi.",
    fallbackLanguage: "Fuulli kun ammallee afaan keessanitti hin hiikamne, kanaaf Afaan Ingiliffaan dhiyaate.",
    draft: "Wixinee: ammallee ogeessaan hin sakatta'amne.",
    sources: "Madda",
    accessed: (date: string) => `kan dubbifame ${date}`,
    updated: (date: string) => `Kan haaromfame ${date}`,
    askAbout: "Waa'ee kanaa Daadaa gaafadhaa",
    notFound: "Fuula kana argachuu hin dandeenye."
  },
  rights: {
    eyebrow: "Mirgoota keessan",
    chooseCountry: "Biyya filadhaa"
  },
  journey: {
    eyebrow: "Qajeelfama imalaa",
    empty: "Kutaa imalaa kanaaf ammaaf qajeelfamni hin jiru.",
    sensitive: "Hubachiisa"
  },
  agencies: {
    title: "Ejansiin koo hayyama qabaa?",
    intro: "Waan tokkollee osoo hin kaffalin ykn paaspoortii keessan osoo hin kennin dura mirkaneessaa.",
    label: "Maqaa ejansii ykn lakkoofsa hayyamaa",
    placeholder: "Maqaa ejansii ykn lakkoofsa hayyamaa",
    submit: "Mirkaneessi",
    hint: "Tarree ifa ta'e ejansiiwwan hayyama qaban Itoophiyaa waliin wal bira qabama.",
    licence: (number: string) => `Lakk. hayyamaa ${number}`,
    verdicts: {
      licensed: {
        title: "Hayyama qaba",
        body: "Ejansiin hayyama qabu kaffaltii qacarrii isin kaffalchiisuu hin qabu. Nagahee hunda kuusaa."
      },
      suspended: {
        title: "Hayyamni dhaabbateera",
        body: "Ejansiin kun amma hojjettoota qacaruu hin danda'u. Kaffaltii tokkollee hin kaffalinaa."
      },
      revoked: {
        title: "Hayyamni haqameera",
        body: "Ejansiin kun hojjettoota qacaruuf hin hayyamamuuf. Kaffaltii hin kaffalinaa, paaspoortii keessanis hin kenninaa."
      },
      unknown: {
        title: "Haalli isaa ifa miti",
        body: "Hayyama ejansii kanaa mirkaneessuu hin dandeenye. Osoo hin kaffalin dura Ministeera Hojii fi Ogummaa gaafadhaa."
      },
      notFound: {
        title: "Hin argamne",
        body: "Kaffaltii tokkollee hin kaffalinaa. Maqaan kun tarree hayyamaa nu biratti hin jiru. Daldalaa seeraan alaa ta'uu danda'a — ykn tarreen guutuu dhiisuu danda'a, kanaaf Ministeera Hojii fi Ogummaa waliin mirkaneeffadhaa.",
        report: "Gabaasaa",
        ask: "Daadaa gaafadhaa"
      }
    },
    spotBroker: "Daldalaa seeraan alaa akkamitti adda baafachuu dandeessu"
  },
  about: {
    title: "Waa'ee DadaLink",
    intro:
      "DadaLink hiriyaa nageenya dursu dubartoota Afrikaa hojjettoota manaa ta'anii Galoo fi Libaanositti godaananiif — osoo hin deemin dura, yeroo alaa jiranii fi yeroo manatti deebi'an.",
    whatTitle: "DadaLink maal hojjeta",
    whatBody:
      "Lakkoofsota gargaarsaa biyya hundaaf, mirgoota keessan, qajeelfama imalaa, mirkaneessa ejansii qacarrii, fi Daadaa: gargaartuu odeeffannoo garee keenyaan sakatta'ame qofaan deebistu.",
    channelsBody:
      "DadaLink Telegram keessattii fi appii Android ta'ees ni hojjeta. Appiin akeekkachiisa SOS nama amanattaniif, galmee dhuunfaa fi haala dhoksaa ni dabala.",
    privacyTitle: "Waadaa dhuunfaa keenya",
    privacyItems: [
      "Akkaawuntii hin jiru, maqaan hin jiru, lakkoofsi bilbilaa hin jiru.",
      "Hordoffii, beeksisa ykn tarkaanfii hordoffii tokkollee hin jiru. Qubeewwan DadaLink mataa isaa irraa dhufu.",
      "Gaaffiin Daadaaf dhiyeessitan hin kuufamu. Lakkoofsi tasaa bilbila kana irra jiru gaaffilee guyyaa keessan qofa lakkaa'a.",
      "Biraawuzariin kun afaan, biyya fi sadarkaa imala keessanii qofa yaadata.",
      "“Dhoksi” marsariitii battalumatti dhiisa. Seenaa biraawuzarii keessanii garuu haquu hin danda'u: namni bilbila keessan sakatta'u yoo jiraate foddaa dhuunfaa (private window) fayyadamaa."
    ],
    whoTitle: "Nuti eenyu",
    whoBody:
      "DadaLink kan hojjetame Recite Labs Finfinnee, Itoophiyaa keessatti, dubartoota biyya alaatti hojjetan waliin. Odeeffannoon osoo Daadaan itti hin fayyadamin dura ogeeyyiin ni sakatta'u.",
    openSourceTitle: "Madda banaa",
    openSourceBody:
      "DadaLink sooftiweerii bilisaa hayyama GNU AGPL-3.0 jalatti. Koodiin yeroo jalqabaa qophaa'u ni maxxanfama.",
    translationsTitle: "Hiikkaa",
    translationsBody:
      "Maddi Afaan Ingiliffaa dha. Barreeffamni Afaan Amaaraa fi Afaan Oromoo wixinee yoo ta'u, dubbattoota afaanichaatiin sakatta'amaa jira."
  },
  errors: {
    title: "Rakkoon uumame",
    body: "Maaloo irra deebi'aa yaalaa. Balaa keessa yoo jirtan, lakkoofsota balaa tasaa fayyadamaa.",
    notFoundTitle: "Fuulli hin argamne",
    notFoundBody: "Fuulli kun hin jiru ykn bakka biraatti godaaneera.",
    goHome: "Gara fuula jalqabaa deemi",
    offline: "Walqunnamtiin hin jiru. Interneetii keessan mirkaneeffadhaatii irra deebi'aa yaalaa."
  },
  footer: {
    madeBy: "Recite Labs, Finfinneetiin kan hojjetame",
    draftNotice: "Hiikkaan kun wixinee dha, sakatta'iinsa eegaa jira."
  }
}
