import type { ReactNode } from "react"
import { useI18n } from "../../i18n/index.ts"
import { PageHeader } from "../../ui/PageHeader.tsx"

/**
 * Privacy policy for the website, the Telegram bot and the Android app (linked from Google Play).
 * English is the legal source text, so it is not part of the translated message catalog.
 * Keep it in step with what the code does: packages/db/src/schema, SosRelay, the assistant pipeline.
 */
const UPDATED = "31 October 2026"
const CONTACT = "privacy@recitelabs.com"

const Section = ({ title, children }: { readonly title: string; readonly children: ReactNode }) => (
  <section className="flex flex-col gap-2">
    <h2 className="text-[20px] leading-[26px] font-extrabold tracking-snug">{title}</h2>
    <div className="flex flex-col gap-2 text-[16px] text-muted">{children}</div>
  </section>
)

const List = ({ items }: { readonly items: ReadonlyArray<string> }) => (
  <ul className="flex list-disc flex-col gap-1.5 pl-5">
    {items.map((item) => (
      <li key={item}>{item}</li>
    ))}
  </ul>
)

export const PrivacyPage = () => {
  const { t } = useI18n()
  return (
    <div lang="en" className="flex flex-col gap-8">
      <PageHeader
        eyebrow={t.nav.privacy}
        title="Privacy policy"
        intro={`DadaLink is made by Recite Labs, Addis Ababa, Ethiopia. This policy covers the DadaLink website, the DadaLink Telegram bot and the DadaLink Android app. Last updated ${UPDATED}.`}
      />

      <Section title="The short version">
        <List
          items={[
            "No accounts. We never ask for your name, email or phone number.",
            "No ads, no analytics, no trackers. We never sell personal data or share it for advertising.",
            "What you write in the app (your log and trusted contacts) stays on your phone, encrypted.",
            "Your questions to Dada are answered and then forgotten. We do not keep chat history."
          ]}
        />
      </Section>

      <Section title="Data that stays on your phone (Android app)">
        <p>
          Your private log, check-ins, trusted contacts, PIN and settings are stored only on your
          device, in an encrypted database whose key is protected by the Android Keystore. We cannot see them. They are
          deleted when you delete the app or its data. If you choose to share your log, you decide where it goes.
        </p>
      </Section>

      <Section title="Questions to Dada">
        <p>
          When you ask Dada a question, the text is sent to our server, which removes phone numbers and similar details
          it can recognise, and finds answers in information our team has reviewed. To write the answer we use Claude,
          an AI model from Anthropic, reached through Cloudflare AI Gateway. Anthropic does not use this data to train
          its models and keeps it only for a limited time under its commercial terms.
        </p>
        <p>
          We do not store your questions or Dada's answers. To limit how many questions can be asked each day we keep a
          one-way salted hash of a random number created on your device; it cannot be linked to you and expires after a
          day. If you rate an answer, we keep only "helpful" or "not helpful", the language, the day and which guides
          were used, never the question.
        </p>
      </Section>

      <Section title="SOS alerts">
        <p>
          SOS sends an alert, with your location if you allow it, to the trusted contact you chose. Our server passes it
          to an SMS provider or to Telegram and keeps no copy of the message, the contact or the location. If that
          fails, the app sends the SMS from your own phone. To stop misuse, the server counts alerts per device using a
          salted hash that expires after an hour.
        </p>
        <p>The app reads your location only when you send an SOS. It does not track you in the background.</p>
      </Section>

      <Section title="The Telegram bot">
        <p>
          The bot remembers your chosen language and country, stored against a one-way salted hash of your Telegram chat
          ID, so we cannot read your chat ID back. Telegram's own privacy policy applies to messages on Telegram.
        </p>
      </Section>

      <Section title="The website">
        <p>
          The website stores your language, country and journey step in your browser only. It sets no tracking cookies
          and loads no third-party scripts or fonts.
        </p>
      </Section>

      <Section title="Service providers">
        <List
          items={[
            "Cloudflare hosts DadaLink. Like any web host it processes IP addresses to deliver pages and block attacks.",
            "Anthropic writes Dada's answers, as described above.",
            "An SMS provider or Telegram delivers SOS alerts relayed by our server."
          ]}
        />
        <p>These providers process data only to run DadaLink.</p>
      </Section>

      <Section title="Children">
        <p>DadaLink is for adults (18+). We do not knowingly collect data from children.</p>
      </Section>

      <Section title="Your choices and rights">
        <p>
          Because we hold no account or profile about you, there is nothing on our side to look up or delete. You can
          remove everything DadaLink keeps by deleting the app, or by clearing this site's data in your browser.
          Questions or requests: {CONTACT}.
        </p>
      </Section>

      <Section title="Changes">
        <p>If this policy changes, we will update this page and the date above.</p>
      </Section>
    </div>
  )
}
