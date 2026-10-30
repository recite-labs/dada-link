import { Agency, ContentItem, DirectoryEntry } from "@dadalink/domain"
import { Schema } from "effect"

const decodeContent = Schema.decodeUnknownSync(ContentItem)
const decodeEntry = Schema.decodeUnknownSync(DirectoryEntry)
const decodeAgency = Schema.decodeUnknownSync(Agency)

export const DEVICE_ID = "6f1c1d2e-8a3b-4c5d-9e6f-7a8b9c0d1e2f"

export const unpaidWages = decodeContent({
  id: "abroad/unpaid-wages",
  kind: "article",
  phase: "abroad",
  countries: [],
  topics: ["money", "rights"],
  sources: [{ title: "ILO Domestic Workers Convention", url: "https://www.ilo.org/" }],
  translations: [
    {
      locale: "en",
      status: "reviewed",
      title: "When your salary is not paid",
      summary: "What to do if your employer withholds your wages.",
      body: "If your employer does not pay your salary, write down every month that was unpaid. Keep copies of your contract. Contact the labour hotline or your embassy to file a wage complaint."
    },
    {
      locale: "am",
      status: "draft-ai",
      title: "ደሞዝዎ ካልተከፈለ",
      summary: "አሠሪዎ ደሞዝዎን ቢከለክል ምን ማድረግ እንዳለብዎ።",
      body: "አሠሪዎ ደሞዝዎን ካልከፈለ ያልተከፈሉትን ወራት ይመዝግቡ። የውልዎን ቅጂ ያስቀምጡ። ለሠራተኛ የስልክ መስመር ወይም ለኤምባሲዎ ያመልክቱ።"
    }
  ]
})

export const passportRetention = decodeContent({
  id: "rights-sa",
  kind: "rights",
  phase: "abroad",
  countries: ["SA"],
  topics: ["rights", "documents"],
  sources: [{ title: "Saudi Ministry of Human Resources", url: "https://hrsd.gov.sa/" }],
  translations: [
    {
      locale: "en",
      status: "reviewed",
      title: "Your rights in Saudi Arabia",
      summary: "Passport, rest day and contract rights for domestic workers in Saudi Arabia.",
      body: "Your employer is not allowed to keep your passport. You have the right to one rest day each week and to your salary every month."
    }
  ]
})

export const contraception = decodeContent({
  id: "before/contraception",
  kind: "article",
  phase: "before",
  countries: [],
  topics: ["health", "srh"],
  sources: [{ title: "WHO Family planning", url: "https://www.who.int/" }],
  translations: [
    {
      locale: "en",
      status: "draft",
      title: "Contraception before you travel",
      summary: "Methods that last through a two-year contract.",
      body: "Long-acting contraception such as an implant or an IUD can last for years. Ask a health centre before you travel."
    }
  ]
})

export const allContent: ReadonlyArray<ContentItem> = [unpaidWages, passportRetention, contraception]

export const saDirectory: ReadonlyArray<DirectoryEntry> = [
  decodeEntry({
    id: "sa-police",
    country: "SA",
    kind: "police",
    name: "Police",
    names: { am: "ፖሊስ" },
    phone: "999",
    emergency: true,
    sourceUrl: "https://www.my.gov.sa/",
    verified: false
  }),
  decodeEntry({
    id: "sa-ambulance",
    country: "SA",
    kind: "ambulance",
    name: "Ambulance (Red Crescent)",
    phone: "997",
    emergency: true,
    sourceUrl: "https://www.my.gov.sa/",
    verified: false
  }),
  decodeEntry({
    id: "sa-ethiopian-embassy",
    country: "SA",
    kind: "embassy",
    name: "Embassy of Ethiopia, Riyadh",
    phone: null,
    whatsapp: "+966 11 000 0000",
    address: "Riyadh",
    notes: "Number to be verified",
    emergency: false,
    sourceUrl: "https://mfa.gov.et/",
    verified: false,
    lastVerified: "2026-10-31"
  })
]

export const lbDirectory: ReadonlyArray<DirectoryEntry> = [
  decodeEntry({
    id: "lb-internal-security",
    country: "LB",
    kind: "police",
    name: "Internal Security Forces",
    phone: "112",
    emergency: true,
    sourceUrl: "https://www.isf.gov.lb/",
    verified: false
  })
]

export const agencies: ReadonlyArray<Agency> = [
  decodeAgency({
    id: "et-agency-001",
    name: "Selam Overseas Employment Agency PLC",
    licenceNumber: "MoLS/OEA/001/2024",
    status: "licensed",
    region: "Addis Ababa",
    sourceUrl: "https://mols.gov.et/"
  }),
  decodeAgency({
    id: "et-agency-002",
    name: "Abay Foreign Employment Agent",
    licenceNumber: "MoLS/OEA/002/2023",
    status: "revoked",
    sourceUrl: "https://mols.gov.et/"
  })
]
