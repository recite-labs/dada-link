import {
  type Citation,
  ContentSummary,
  type Country,
  DirectoryEntry,
  EmergencyContact,
  EmergencyNotice,
  LocalizedContent
} from "@dadalink/domain"

/** Domain values built through the real schema classes, so fixtures stay valid as the contract evolves. */
export const directoryEntry = (
  fields: Omit<Partial<ConstructorParameters<typeof DirectoryEntry>[0]>, "id"> & { readonly id: string }
) =>
  new DirectoryEntry({
    country: "SA",
    kind: "ngo",
    name: "Example service",
    names: {},
    phone: null,
    shortCode: null,
    helpsWith: [],
    languages: [],
    emergency: false,
    sourceUrl: "https://example.org/source",
    verified: false,
    ...fields,
    id: fields.id as never
  })

export const DIRECTORY_FIXTURES: ReadonlyArray<DirectoryEntry> = [
  directoryEntry({
    id: "sa-embassy",
    kind: "embassy",
    name: "Embassy of Ethiopia, Riyadh",
    names: { am: "የኢትዮጵያ ኤምባሲ፣ ሪያድ" },
    phone: "+966 11 482 3919",
    hours: "Sun–Thu 8–16",
    verified: true
  }),
  directoryEntry({
    id: "sa-police",
    kind: "police",
    name: "Police",
    names: { am: "ፖሊስ" },
    shortCode: "999",
    emergency: true,
    helpsWith: ["emergency", "abuse"]
  }),
  directoryEntry({ id: "sa-shelter", kind: "shelter", name: "Women's shelter", url: "https://example.org/shelter" }),
  directoryEntry({
    id: "sa-hotline",
    kind: "labour-hotline",
    name: "Musaned hotline",
    shortCode: "19911",
    phone: "+966 11 000 0000",
    helpsWith: ["wages"]
  }),
  directoryEntry({ id: "sa-ambulance", kind: "ambulance", name: "Ambulance", shortCode: "997", emergency: true })
]

export const EMERGENCY_FIXTURES: Partial<Record<Country, ReadonlyArray<EmergencyContact>>> = {
  SA: [
    new EmergencyContact({ name: "Police", kind: "police", phone: "999" }),
    new EmergencyContact({ name: "Ambulance", kind: "ambulance", phone: "997" })
  ]
}

export const emergencyNotice = () =>
  new EmergencyNotice({
    categories: ["violence"],
    message: "If you are in danger right now, press SOS and call: 999 (Police).",
    contacts: EMERGENCY_FIXTURES.SA ?? []
  })

export const citation = (contentId: string, title: string): Citation => ({ contentId, title, locale: "en" }) as Citation

const content = (
  fields: Omit<Partial<ConstructorParameters<typeof LocalizedContent>[0]>, "id"> & { readonly id: string }
) =>
  new LocalizedContent({
    kind: "article",
    phase: "abroad",
    countries: [],
    topics: [],
    sources: [],
    locale: "en",
    requestedLocale: "en",
    status: "draft-ai",
    title: "Title",
    summary: "Summary",
    body: "Body",
    availableLocales: ["en"],
    sensitive: false,
    related: [],
    ...fields,
    id: fields.id as never
  })

export const CONTENT_FIXTURES: Readonly<Record<string, LocalizedContent>> = {
  "rights-sa": content({
    id: "rights-sa",
    kind: "rights",
    countries: ["SA"],
    title: "Your rights as a domestic worker in Saudi Arabia",
    summary: "A contract, monthly pay and a weekly day off.",
    body: "## Your contract\n\n- Your contract must be in a language you understand. [1]",
    sources: [
      { title: "MHRSD regulation", url: "https://hrsd.gov.sa/regulation", publisher: "MHRSD", accessed: "2026-10-31" }
    ] as never
  }),
  "abuse-what-to-do": content({
    id: "abuse-what-to-do",
    title: "If someone hurts you",
    summary: "Steps to stay safe.",
    body: "You are **not** to blame.\n\n<script>alert(1)</script>\n\n![tracker](https://evil.example/pixel.png)",
    sensitive: true,
    locale: "en",
    requestedLocale: "om"
  })
}

export const JOURNEY_FIXTURES: ReadonlyArray<ContentSummary> = [
  new ContentSummary({
    id: "unpaid-wages" as never,
    kind: "article",
    phase: "abroad",
    countries: [],
    topics: ["wages"],
    locale: "en",
    status: "draft-ai",
    title: "When your salary is not paid",
    summary: "What you can do.",
    sensitive: false
  }),
  new ContentSummary({
    id: "abuse-what-to-do" as never,
    kind: "article",
    phase: "abroad",
    countries: [],
    topics: ["abuse"],
    locale: "en",
    status: "draft-ai",
    title: "If someone hurts you",
    summary: "Graphic summary that must not be previewed.",
    sensitive: true
  })
]
