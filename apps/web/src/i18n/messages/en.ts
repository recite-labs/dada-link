/**
 * English UI strings: the source catalogue. Every other language must provide
 * exactly the same keys (enforced by the `Messages` type).
 */
export const en = {
  meta: {
    /** Name of the language, written in that language. */
    languageName: "English",
    shortLabel: "EN",
    /** `source` for English; `draft-ai` until a native speaker has reviewed the catalogue. */
    status: "source" as "source" | "draft-ai"
  },
  common: {
    appName: "DadaLink",
    tagline: "A sister in your pocket",
    loading: "Loading…",
    retry: "Try again",
    close: "Close",
    call: "Call",
    copy: "Copy",
    copied: "Copied",
    notVerified: "not yet verified",
    opensInNewTab: "(opens in a new tab)"
  },
  nav: {
    main: "Main",
    home: "Home",
    ask: "Ask",
    sos: "SOS",
    help: "Help",
    about: "About",
    privacy: "Privacy",
    language: "Language",
    homeLink: "DadaLink home"
  },
  hide: {
    label: "Hide",
    description: "Leave this site now and open a weather page"
  },
  countries: {
    SA: "Saudi Arabia",
    AE: "United Arab Emirates",
    KW: "Kuwait",
    QA: "Qatar",
    LB: "Lebanon",
    JO: "Jordan",
    ET: "Ethiopia"
  },
  countriesShort: {
    SA: "Saudi Arabia",
    AE: "UAE",
    KW: "Kuwait",
    QA: "Qatar",
    LB: "Lebanon",
    JO: "Jordan",
    ET: "Ethiopia"
  },
  phases: {
    before: "Before",
    abroad: "Abroad",
    return: "Return"
  },
  phaseTitles: {
    before: "Before you go",
    abroad: "While you are abroad",
    return: "Coming home"
  },
  home: {
    greeting: "Selam, sister.",
    question: "How can we help today?",
    journeyLabel: "Where are you on your journey?",
    countryLabel: {
      before: "Where are you going?",
      abroad: "Where are you now?",
      return: "Where are you now?"
    },
    askTitle: "Ask Dada",
    askBody: "Health, your rights, your contract — ask anything, privately.",
    askPlaceholder: "Write your question…",
    askSubmit: "Ask",
    tiles: {
      help: { title: "Help numbers", body: "Embassy, hotlines, IOM" },
      rights: { title: "My rights", body: "Contract, pay, passport" },
      journey: { title: "Journey guides", body: "What to know, step by step" },
      agencies: { title: "Is my agency licensed?", body: "Check before you pay" }
    },
    emergencyTitle: "In danger right now?",
    emergencyBody: (country: string) => `Emergency numbers for ${country}`,
    emergencyAction: "Show numbers"
  },
  emergency: {
    title: "Call for help now",
    subtitle: (country: string) => `Emergency numbers in ${country}`,
    noNumbers: "We could not load the numbers. Call the police or your embassy.",
    webNote:
      "This website cannot send an SOS message. The DadaLink app can alert someone you trust by SMS, even without internet.",
    getApp: "Get the app",
    allNumbers: "All help numbers",
    callNumber: (name: string, number: string) => `Call ${name}: ${number}`
  },
  ask: {
    title: "Ask Dada",
    subtitle: "Reviewed answers · private",
    emptyTitle: "What would you like to know?",
    emptyBody: "Dada answers from information checked by our team. Nothing you write is saved.",
    suggestions: ["My employer took my passport", "My salary was not paid", "I feel very lonely"],
    placeholder: "Write your question…",
    send: "Send",
    disclaimer: "Dada gives information, not legal or medical advice. In danger?",
    disclaimerSos: "Press SOS.",
    you: "You",
    dada: "Dada",
    thinking: "Dada is looking for an answer…",
    sources: "Sources",
    emergencyTitle: "Your safety first",
    quotaTitle: "You have used today's questions",
    quotaBody:
      "To keep Dada free for everyone, there is a daily limit. You can ask again tomorrow. Help numbers and guides are always open.",
    errorUnavailable: "Dada cannot answer right now. Please try again in a moment.",
    errorNetwork: "No connection. Check your internet and try again.",
    errorInvalid: "Please write a shorter question.",
    stopped: "Stopped."
  },
  help: {
    title: "Help numbers",
    countryLabel: "Country",
    emergencyHeading: "Emergency",
    groups: {
      emergency: "Emergency",
      missions: "Ethiopian missions",
      work: "Work and protection",
      support: "Shelter and support",
      health: "Health",
      return: "Returnee services",
      other: "Other services"
    },
    noNumber: "No public number yet",
    website: "Website",
    whatsapp: "WhatsApp",
    email: "Email",
    hours: "Hours",
    details: "Details (English)",
    copyNumber: (name: string) => `Copy the number of ${name}`,
    callNumber: (name: string) => `Call ${name}`,
    empty: "We do not have help numbers for this country yet.",
    source: "Source",
    unverifiedNote:
      "Numbers come from official public sources. Ones marked “not yet verified” have not been called by our team yet."
  },
  topics: {
    emergency: "emergency",
    abuse: "abuse",
    "sexual-violence": "sexual violence",
    wages: "wages",
    passport: "passport",
    documents: "documents",
    "labour-complaint": "labour complaints",
    shelter: "shelter",
    repatriation: "going home",
    legal: "legal help",
    health: "health",
    "mental-health": "mental health",
    trafficking: "trafficking",
    detention: "detention",
    "returnee-support": "returnee support",
    fire: "fire",
    srh: "sexual and reproductive health",
    rights: "rights",
    money: "money",
    agencies: "agencies",
    safety: "safety",
    return: "return"
  },
  content: {
    sensitiveTitle: "Content note",
    sensitiveBody:
      "This page talks about violence or other painful experiences. Read it when you feel ready. If you are in danger, press SOS.",
    fallbackLanguage: "This page is not yet translated into your language, so it is shown in English.",
    draft: "Draft: not yet reviewed by an expert.",
    sources: "Sources",
    accessed: (date: string) => `read on ${date}`,
    updated: (date: string) => `Updated ${date}`,
    askAbout: "Ask Dada about this",
    notFound: "We could not find this page."
  },
  rights: {
    eyebrow: "Your rights",
    chooseCountry: "Choose a country"
  },
  journey: {
    eyebrow: "Journey guides",
    empty: "No guides for this part of the journey yet.",
    sensitive: "Content note"
  },
  agencies: {
    title: "Is my agency licensed?",
    intro: "Check before you pay anything or hand over your passport.",
    label: "Agency name or licence number",
    placeholder: "Agency name or licence number",
    submit: "Check",
    hint: "Checked against the published list of licensed agencies in Ethiopia.",
    licence: (number: string) => `Licence no. ${number}`,
    verdicts: {
      licensed: {
        title: "Licensed",
        body: "A licensed agency must not charge you a placement fee. Keep every receipt."
      },
      suspended: {
        title: "Licence suspended",
        body: "This agency may not recruit right now. Do not pay any fee."
      },
      revoked: {
        title: "Licence revoked",
        body: "This agency is not allowed to recruit. Do not pay any fee or hand over your passport."
      },
      unknown: {
        title: "Status unclear",
        body: "We could not confirm this agency's licence. Ask the Ministry of Labour and Skills before you pay anything."
      },
      notFound: {
        title: "Not found",
        body: "Do not pay any fee. This name is not on the licensed list we have. It may be an illegal broker — or the list may be incomplete, so check with the Ministry of Labour and Skills.",
        report: "Report it",
        ask: "Ask Dada"
      }
    },
    spotBroker: "How to spot an illegal broker"
  },
  about: {
    title: "About DadaLink",
    intro:
      "DadaLink is a safety-first companion for African women who migrate to the Gulf and Lebanon as domestic workers — before they go, while they are away, and when they come home.",
    whatTitle: "What DadaLink does",
    whatBody:
      "Help numbers for each country, your rights, journey guides, a check for recruitment agencies, and Dada: an assistant that answers only from information our team has reviewed.",
    channelsBody:
      "DadaLink also works in Telegram and as an Android app. The app adds an SOS alert to someone you trust, a private log, and a disguise mode.",
    privacyTitle: "Our privacy promise",
    privacyItems: [
      "No accounts, no names, no phone numbers.",
      "No analytics, no ads, no trackers. Fonts are served by DadaLink itself.",
      "Your questions to Dada are not saved. A random number on this device only counts your daily questions.",
      "This browser remembers only your language, country and journey step.",
      "“Hide” leaves the site at once. It cannot erase your browser history: use a private window if someone checks your phone."
    ],
    whoTitle: "Who we are",
    whoBody:
      "DadaLink is made by Recite Labs in Addis Ababa, Ethiopia, with women who have worked abroad. Content is checked by experts before Dada uses it.",
    openSourceTitle: "Open source",
    openSourceBody:
      "DadaLink is free software under the GNU AGPL-3.0 licence. The code will be published once the first version is ready.",
    translationsTitle: "Translations",
    translationsBody:
      "English is the source. Amharic and Afaan Oromo texts are drafts and are being reviewed by native speakers."
  },
  errors: {
    title: "Something went wrong",
    body: "Please try again. If you are in danger, use the emergency numbers.",
    notFoundTitle: "Page not found",
    notFoundBody: "This page does not exist or has moved.",
    goHome: "Go to home",
    offline: "No connection. Check your internet and try again."
  },
  footer: {
    madeBy: "Made by Recite Labs, Addis Ababa",
    draftNotice: "This translation is a draft awaiting review."
  }
}

export type Messages = typeof en
