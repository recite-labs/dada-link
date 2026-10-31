/**
 * Query-expansion vocabulary for lexical retrieval (see ADR 0003).
 *
 * Each group lists **stems** that mean the same thing to a user, across
 * English, Amharic and Afaan Oromo. When a query term starts with any stem of
 * a group, every stem of that group is added to the query. Stems are matched
 * as prefixes by the retrievers (FTS5 `"stem"*` / BM25 prefix), so a stem such
 * as `licen` covers licence, license, licensed and licensing.
 *
 * Rules for editing:
 * - lower-case, NFKC, letters only (a single `searchTerms` token);
 * - keep stems specific: a stem that is a common prefix of unrelated words
 *   adds noise to every query that touches the group;
 * - Amharic and Oromo stems come from the words the reviewed articles
 *   actually use (grep `content/**\/*.am.md` and `*.om.md`), including
 *   spelling variants (ሕ/ህ, ejansii/ejensii, deelaalaa/delaalaa).
 */
export const SEARCH_SYNONYMS: ReadonlyArray<ReadonlyArray<string>> = [
  // Is it legal / licensed / registered?
  [
    "legal",
    "illegal",
    "licen",
    "unlicen",
    "regist",
    "unregist",
    "authoris",
    "authoriz",
    "accredit",
    "ሕጋዊ",
    "ህጋዊ",
    "ሕገወጥ",
    "ህገወጥ",
    "ፈቃድ",
    "hayyam",
    "seera"
  ],
  // Agency, agent, broker, recruiter
  [
    "agenc",
    "agent",
    "broker",
    "recruit",
    "middleman",
    "middlemen",
    "ኤጀንሲ",
    "ደላላ",
    "ደላሎ",
    "ejans",
    "ejens",
    "eejans",
    "deelaal",
    "delaal"
  ],
  // Passport and documents
  ["passport", "document", "paper", "ፓስፖርት", "ሰነድ", "መታወቂያ", "paaspoor", "sanad"],
  // Salary, wages, pay
  ["salar", "wage", "pay", "paid", "unpaid", "ደመወዝ", "ደመወዜ", "ደሞዝ", "ደሞዜ", "ክፍያ", "mindaa", "kaffal"],
  // Contract
  ["contract", "agreement", "ውል", "ኮንትራት", "waliigalt"],
  // Employer
  ["employer", "boss", "sponsor", "አሰሪ", "አሠሪ", "ቀጣሪ", "hojjechiis"]
]

/**
 * Amharic prepositional prefixes (of, by/in, for/to, from, like, about) that
 * attach to nouns: የኤጀንሲው, ለደላላ, ከአሰሪዬ. Stripped before stem matching.
 */
export const AMHARIC_PROCLITICS: ReadonlyArray<string> = ["እንደ", "ስለ", "የ", "በ", "ለ", "ከ"]
