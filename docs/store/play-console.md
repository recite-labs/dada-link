# Google Play: DadaLink release checklist

Listing for `me.kibru.damakese` (formerly Damakese). Copy-ready answers for every Play Console form,
written to match what the code does. Re-check this file whenever SOS, the assistant or storage changes.

Store assets and listing text live in `apps/android/fastlane/metadata/android/en-US/` (fastlane `supply`
layout), designed on the **Play Store** page of the `dadalink` Paper file.

| Asset | File | Spec |
| --- | --- | --- |
| App icon | `images/icon.png` | 512 × 512 PNG |
| Feature graphic | `images/featureGraphic.jpg` | 1024 × 500, no alpha |
| Phone screenshots | `images/phoneScreenshots/*.jpg` | 8 × 1080 × 1920, no alpha |
| Title | `title.txt` | 26 / 30 chars |
| Short description | `short_description.txt` | 71 / 80 chars |
| Full description | `full_description.txt` | ~2,000 / 4,000 chars |
| Release notes | `changelogs/<versionCode>.txt` | ≤ 500 chars |

## Main store listing

- **App name:** `DadaLink: safe work abroad`
- **Category:** Health & Fitness. Tags: Women's health, Safety.
- **Contact email:** a monitored Recite Labs address (Play shows it publicly).
- **Website:** https://dadalink.recitelabs.com
- **Privacy policy:** https://dadalink.recitelabs.com/en/privacy

The listing does **not** mention the calculator/notes disguise. Advertising it would tell an abusive employer what
to look for. Keep it out of screenshots, descriptions and release notes.

## App content

### Privacy policy
`https://dadalink.recitelabs.com/en/privacy`

### Ads
No, the app contains no ads.

### App access
"All functionality is available without special access." No login and no account. The PIN is created by the
user on the device. Nothing in the app needs credentials from us.

### Target audience and content
- Target age: **18 and over** only.
- Not designed for children; no appeal to children.

### Content rating (IARC questionnaire)
- Category: **Reference, News, or Educational** (not a game).
- Violence: no depictions. Text-only *information* about abuse and sexual violence, for victims' safety.
- Sexuality: no sexual content. Reproductive-health information (pregnancy, contraception).
- Drugs, gambling, profanity: no.
- User-generated content shared between users: **no** (no social features, no chat between users).
- Shares user location with other users: **no**. SOS sends the location only to a contact the user chose,
  on the user's action.
- AI-generated content: **yes**. The assistant answers from reviewed guides, with an emergency fallback
  and a "not legal or medical advice" notice.

### News app / Government app / Financial features
No / No / None.

### Health apps declaration
- Features: **health information/education** (reproductive and sexual health, mental wellbeing) and
  **personal safety / emergency alerts**.
- Not a medical device. No diagnosis or treatment. Shows "not medical advice" in the app.
- No health data leaves the phone except the text of questions the user chooses to ask (see Data safety).

## Data safety form

Overview answers:
- Does your app collect or share any of the required user data types? **Yes**
- Is all user data encrypted in transit? **Yes**. HTTPS only; `network_security_config.xml` sets
  `cleartextTrafficPermitted="false"`.
- Do you provide a way for users to request deletion? There is **no account**: data is not linked to a person
  and server-side data expires automatically. Users remove local data by uninstalling.

Per data type. "Ephemeral" means processed in memory to serve the request and not stored:

| Data type | Collected | Shared* | Ephemeral | Required | Purpose |
| --- | --- | --- | --- | --- | --- |
| Location: approximate | Yes | No | Yes | Optional | App functionality (SOS) |
| Location: precise | Yes | No | Yes | Optional | App functionality (SOS) |
| Personal info: phone number (trusted contact, SOS relay) | Yes | No | Yes | Optional | App functionality |
| Messages: other in-app messages (SOS text) | Yes | No | Yes | Optional | App functionality |
| App activity: other user-generated content (questions to Dada) | Yes | No | Yes | Optional | App functionality |
| Health and fitness: health info (health questions to Dada) | Yes | No | Yes | Optional | App functionality |
| App activity: other actions (helpful / not helpful rating) | Yes | No | No | Optional | Analytics (product quality) |
| Device or other IDs (random install ID, stored only as a salted hash with a TTL) | Yes | No | No | Required | Fraud prevention, security (rate limits) |

\* Not "shared": Anthropic (answers), Cloudflare (hosting) and the SMS provider / Telegram (SOS delivery)
act as **service providers** processing on our behalf, and SOS delivery is a **user-initiated transfer**.
Both are exempt from "sharing" under Play's definitions.

Not collected by DadaLink: name, email, contacts list, photos (the log's photos never leave the phone), files,
calendar, web history, installed apps, financial info. Voice input uses Android's speech recognition service;
DadaLink only receives the resulting text.

## Permissions declaration

### SMS / Call Log: none
The app requests **no** SMS or Call Log permission, so no SMS/Call Log declaration is needed.
If the Console still shows one, remove it: do **not** tick "Default SMS handler" or "Default Phone handler".

History: 6.0.0 (vc 201) declared `SEND_SMS` and was rejected on 2026-11-03 (declared default SMS / Phone
handler use cases the app does not have; listing and in-app experience did not match). Since 6.0.1
(vc 202) the SOS goes through the server relay and then opens the user's SMS app with the alert filled
in (`ACTION_SENDTO`); the user presses send. The manifest also strips `SEND_SMS` if a library adds it.
Re-adding direct SMS would need the *Physical safety / emergency alerts* exception, a demo video and a
listing that promotes the feature.

### Location (`ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`)
Foreground only, requested when the user starts an SOS. No background-location declaration needed.

### `POST_NOTIFICATIONS`
Standard runtime permission; no declaration.

## Release

1. Upload `dadalink-6.0.1-vc202.aab` (signed with the Damakese upload key, SHA-256 `95:09:BF:B0:…:EB:82:6E`).
2. Internal testing → closed testing → production with a staged rollout (20% → 100%).
3. Release notes: `changelogs/202.txt`.

## Before submitting

- [ ] Cloudflare AI Gateway `dada` → **Settings → Logs: off**. Otherwise the gateway keeps question text,
      and the privacy policy says we don't.
- [ ] The privacy contact mailbox (`privacy@recitelabs.com`) exists or forwards to someone.
- [ ] Amharic / Afaan Oromo listing translations reviewed by native speakers before adding `am-ET` metadata.
