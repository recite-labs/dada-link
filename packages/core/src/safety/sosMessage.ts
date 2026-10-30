import type { GeoLocation, Locale } from "@dadalink/domain"

interface SosTexts {
  readonly lead: string
  readonly messageLabel: string
  readonly locationLabel: string
  readonly noLocation: string
}

/** English is the source; other languages are drafts awaiting native-speaker review. */
const TEXTS: Readonly<Record<Locale, SosTexts>> = {
  en: {
    lead: "DadaLink SOS: someone who trusts you needs help now.",
    messageLabel: "Message:",
    locationLabel: "Location:",
    noLocation: "Location not shared."
  },
  am: {
    lead: "DadaLink SOS፦ የሚያምንዎት ሰው አሁን እርዳታ ይፈልጋል።",
    messageLabel: "መልዕክት፦",
    locationLabel: "ቦታ፦",
    noLocation: "ቦታው አልተጋራም።"
  },
  om: {
    lead: "DadaLink SOS: namni isin amanu amma gargaarsa barbaada.",
    messageLabel: "Ergaa:",
    locationLabel: "Bakka:",
    noLocation: "Bakki hin qoodamne."
  },
  sw: {
    lead: "DadaLink SOS: mtu anayekuamini anahitaji msaada sasa hivi.",
    messageLabel: "Ujumbe:",
    locationLabel: "Mahali:",
    noLocation: "Mahali hapajashirikiwa."
  },
  ti: {
    lead: "DadaLink SOS፦ ዝኣምነኩም ሰብ ሕጂ ሓገዝ የድልዮ ኣሎ።",
    messageLabel: "መልእኽቲ፦",
    locationLabel: "ቦታ፦",
    noLocation: "ቦታ ኣይተኻፈለን።"
  }
}

/** Free text is capped so the alert fits in a couple of SMS segments. */
export const MAX_SOS_TEXT_MESSAGE = 140

const round = (n: number) => Math.round(n * 100_000) / 100_000

export const mapLink = (location: GeoLocation) =>
  `https://maps.google.com/?q=${round(location.latitude)},${round(location.longitude)}`

export interface SosTextInput {
  readonly locale: Locale
  readonly message?: string
  readonly location?: GeoLocation
}

/**
 * The alert sent to the trusted contact. It never contains her name or
 * number: the contact knows who set them up, a bystander reading it does not.
 */
export const buildSosText = (input: SosTextInput): string => {
  const t = TEXTS[input.locale]
  const message =
    input.message === undefined
      ? ""
      : ` ${t.messageLabel} "${input.message.length > MAX_SOS_TEXT_MESSAGE ? `${input.message.slice(0, MAX_SOS_TEXT_MESSAGE)}…` : input.message}"`
  const location =
    input.location === undefined
      ? ` ${t.noLocation}`
      : ` ${t.locationLabel} ${mapLink(input.location)}${
          input.location.accuracyMeters === undefined ? "" : ` (±${Math.round(input.location.accuracyMeters)} m)`
        }`
  return `${t.lead}${message}${location}`
}
