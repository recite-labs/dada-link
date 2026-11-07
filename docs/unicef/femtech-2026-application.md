# UNICEF Femtech Ventures, call 2: application draft

- **Call:** https://www.unicef.org/innovation/FemTechCall
- **Form:** https://form.jotform.com/262722015144346
- **Deadline:** 11 November 2026, 23:59 CET. Answers must be in English.
- **Offer:** up to US$100,000, equity-free, plus 12 months of mentorship and UNICEF's network.

This file follows the form field by field. Items marked **TODO** need a fact only the team has. Everything else
matches what is in this repository and live at https://dadalink.recitelabs.com as of 7 Nov 2026. Don't claim
anything the code or the tests don't back up.

> **Length limits.** The form shows counters of "0/150" and "0/250" without saying whether they count words or
> characters. Paste one answer into the form first and watch the counter. The drafts below assume **words** and
> stay under each limit. If the counter turns out to count characters, use the short version (≤150 / ≤250 characters)
> given under each answer.

## How we're scored (2022 Venture Fund criteria, linked from the call page)

Pass/fail: private company, registered in a programme country, open source (GPL/MIT/BSD for software, CC-BY for
content), working prototype with early results, impact on vulnerable children and young people, publicly
measurable real-time data.

Scored: relevance and problem–solution fit, plus global scale (20). Novelty and the
[Principles for Digital Development](https://digitalprinciples.org) (30). Team (30). Budget and financing (20).

**Gaps to close before submitting:**

1. **Young users.** Spell out that many women migrant domestic workers are adolescent girls or young women
   (underage recruitment on falsified documents is well documented). Our Play listing targets 18+. Present it as
   "young women and adolescent girls at risk of migrating", not as an app for children.
2. **Results.** The returnee testing planned for 7 Nov is our only user evidence. Record numbers: testers, tasks
   completed, quotes.
3. **Content licence.** AGPL-3.0 covers the code, which counts as GPL-family. Add a CC-BY-4.0 licence for
   `content/` so the content qualifies too (one small commit).
4. **Public, measurable data.** We have no public metrics yet. Proposed: a public `/stats` page with aggregate,
   non-identifying counts (questions answered per language, emergency notices shown, SOS relays sent). It's
   consistent with our no-tracking promise and becomes a 12-month milestone.

## Referral source

1. **How did you hear about this call?** TODO (probably "UNICEF Website" or "LinkedIn")
2. **Name of the referring incubator, accelerator, country office or team member:** TODO, otherwise `NA`

## Eligibility

3. **Registered as a private for-profit company?** Yes. TODO: confirm Recite Labs' legal form and registration
   number.
4. **Is your solution open source?** Yes. Code: AGPL-3.0, at https://github.com/recite-labs/dada-link (make it public before submitting).
   Content: CC-BY-4.0 (see gap 3).
5. **Country of registration:** Ethiopia (a UNICEF programme country)

## Diversity, equity and inclusion

6. **Founded or co-founded by women?** TODO
7. **Names of the women founders:** TODO (`NA` if none)
8. **Founded or led by youth (under 35)?** TODO
9. **Names of the young leaders:** TODO
10. **Team table (up to 5 rows):** TODO. Consider listing the content reviewer (Dr. Helen, health content) as an
    advisor-type member if she agrees.

| Full name | Position | Year of birth | Nationality | Gender | Short bio |
| --- | --- | --- | --- | --- | --- |
| TODO | Founder / lead engineer | | Ethiopian | | |
| TODO | Health content lead | | | | |
| TODO | | | | | |

## Company and contact

11. **Company name:** Recite Labs
12. **Website:** https://recitelabs.com (product: https://dadalink.recitelabs.com)
13. **Contact person:** TODO
14. **Designation:** TODO
15. **Primary e-mail:** TODO
16. **Alternate e-mail:** TODO (must be a different person)
17. **Year founded:** TODO

## Proposal

### 18. Pillars

Pillar 3 (mental wellbeing, safety and protection) and Pillar 2 (informed, safe and accessible reproductive
health). Also consider Pillar 1, for referral to health services abroad and on return.

### 19. What need or challenge is your solution addressing in your local context? (≤150)

Every year, hundreds of thousands of Ethiopian women and girls, many of them adolescents from rural areas, migrate
to Saudi Arabia, the Gulf and Lebanon as domestic workers. Under the kafala sponsorship system many have their
passports confiscated, wages withheld and movement restricted, and face physical and sexual violence. They have
almost no access to sexual and reproductive health information or care, and suffer isolation and mental-health
crises. Many return traumatised and unpaid. Illegal brokers exploit them before they leave. A hidden phone is
often their only lifeline, yet there is no trusted, safe, local-language source of help across the journey.
Information is scattered, in Arabic or English, and existing apps can expose a woman to an employer who checks
her phone.

_Short (characters):_ Ethiopian women and girls working as domestic workers in the Gulf and Lebanon face abuse,
withheld wages and no SRH or mental-health support.

### 20. Describe the solution and how it solves these challenges (≤250)

DadaLink ("dada" means sister) is an open-source companion for African women migrant domestic workers in Amharic,
Afaan Oromo and English, with Kiswahili and Tigrinya next. It works through a Telegram bot (nothing to install),
an Android app and the web, and covers the whole journey:

- **Before leaving:** check whether a recruitment agency is licensed under Proclamation 1389/2025; rights and
  contract guides for six destination countries; health preparation, including contraception and SRH; setting up
  a trusted contact.
- **Abroad:** "Ask Dada", an AI assistant that answers only from content our team has reviewed and cites its
  sources. Help numbers per country (embassies, labour ministries, police, shelters) that work offline. A
  hold-to-send SOS with location to a trusted contact by SMS or Telegram. A private, encrypted log of wages,
  hours and incidents, kept on the phone as evidence.
- **Return:** mental-health support, returnee services and help claiming unpaid wages.

Safety is built in. The app can disguise itself as a calculator or notes app. It has one-tap "Hide", a PIN and no
notification previews. No account is needed. Questions are never stored, and personal data stays encrypted on the
device. If a message signals violence, suicidal thoughts or a medical emergency, rules in the code, not the model,
put that country's emergency numbers first.

_Short (characters):_ DadaLink: a discreet AI companion in Amharic and Oromo with reviewed health and rights
answers, offline help numbers, SOS and an encrypted evidence log.

### 21. Technologies

AI/Data Science

### 22. If Other

(leave empty)

### 23. How are you using the technologies? (≤150)

Generative AI powers "Ask Dada". Questions are first matched against our reviewed, multilingual content library
using full-text search with multilingual synonym expansion. Only when relevant sources are found does a large
language model write an answer, in the woman's own language, limited to those sources, with numbered citations
and a "not legal or medical advice" notice. If nothing relevant is found, the model isn't called and a fixed safe
reply is shown. Emergency detection is a deterministic multilingual lexicon, so danger signals never depend on the
model. Phone numbers and ID numbers are removed before a question reaches the model, and no transcripts are kept.
We plan to use aggregate, anonymous data (questions per topic and language) to find gaps in the content and guide
partners.

### 24. Current technical status, and what's needed for pilot or implementation (≤150)

A working prototype is live. It includes a public API and web app (https://dadalink.recitelabs.com, on Cloudflare),
a Telegram bot, and an Android app (6.0.0) prepared for Google Play. It offers rights guides for 7 countries, 30+
journey articles, offline help directories, an agency licence check, SOS relay and an encrypted log. The codebase
is open source with automated tests and CI. For a pilot we need native-speaker and expert review of all Amharic
and Oromo content, field verification of every help number, Kiswahili and Tigrinya, and an Arabic-speaking
referral network. Most of all, we need a supervised pilot with returnees and pre-departure trainees, run with an
Ethiopian partner, plus a safeguarding protocol and an independent security review.

_TODO: replace "prepared for" with "published on" if the Play release is live by then._

### 25. Results of prototyping and testing (quantitative and qualitative) (≤150)

TODO: fill in from the 7 Nov returnee testing. Structure:

- **Quantitative:** number of testers (returnees, pre-departure), share who completed core tasks (find embassy
  number, ask Dada a question, send a test SOS, hide the app), answer accuracy as judged by the reviewer, time to
  find help.
- **Qualitative:** two or three short quotes (with consent, no names), the top requested features, issues found.
- **Technical:** content library size (rights × 7 countries × 3 languages, 30+ articles), live since Nov 2026,
  an automated test suite covering safety rules (emergency detection, grounding fallback, redaction).

### 26. Repository link

https://github.com/recite-labs/dada-link (AGPL-3.0). TODO: the repo is currently private; make it public before submitting

### 27. Targets and milestones for the next 12 months (≤250)

- **Months 1–3:** expert and native-speaker review of all content in Amharic, Afaan Oromo and English, with
  health content reviewed by a clinician. Every help number verified by phone. A safeguarding and referral
  protocol with partners. An independent security and privacy review. Google Play release.
- **Months 3–6:** a supervised pilot with 300 women through pre-departure orientation centres and returnee
  organisations in Addis Ababa and Oromia. Add Tigrinya and Kiswahili. Publish a public dashboard of anonymous,
  aggregate usage data.
- **Months 6–9:** expand to 2,000 active users. Add Kenya and Uganda content (Kiswahili) for women going to Saudi
  Arabia and the UAE. Add mood check-ins and period and pregnancy tools. Train community health workers and
  returnee peers as "sister" champions.
- **Months 9–12:** publish an evaluation (safety incidents handled, referrals, user-reported wellbeing) and
  register DadaLink as a Digital Public Good. Plan the handover and integration with Ministry of Labour and Skills
  pre-departure training and with IOM and NGO referral systems.

_TODO: confirm the targets (300 / 2,000) are realistic with the team._

### 28. Key partners and advisors (≤150)

TODO: list only confirmed partners. Candidates named in the spec (Dr. Helen for content review; outreach planned
to IOM Ethiopia, Agar Ethiopia and the Ministry of Labour and Skills) may be listed **only** if they have agreed.
Otherwise write `NA`, or "Dr. Helen, health content reviewer (advisor)".

### 29. Amount sought

US$100,000. TODO: confirm.

### 30. Revenue last year

TODO (US$)

### 31. Capital and other contributions (≤150)

TODO. Suggested structure: Recite Labs has self-funded development to date (founder time, about X person-months;
Cloudflare and AI hosting costs; an existing Google Play developer account and listing). Add any in-kind help
(content reviewers, testers) and any grants or loans.

Suggested use of the US$100k, for reference: content review and translation 25%, pilot operations and partner
staff 30%, engineering 30%, security review and safeguarding 10%, hosting and AI 5%. TODO: adjust.

### 32. Share the application with partners?

Yes (recommended)

### 33. Subscribe to the newsletter?

Yes

## Pitch video (≤2 min, YouTube, unlisted is fine)

No AI avatars or synthetic voices. The video has to show the team speaking and the solution working.

| Time | Content |
| --- | --- |
| 0:00–0:20 | Founder on camera: the problem, with one human story (anonymised, with consent) |
| 0:20–1:10 | Screen recording: Telegram bot → Ask Dada in Amharic with citations; help numbers offline; SOS hold; calculator disguise and Hide |
| 1:10–1:35 | Safety by design (no account, no transcripts, encrypted, deterministic emergency rules) and early test results |
| 1:35–2:00 | Team; what UNICEF funding unlocks (review, pilot, new languages); open source / Digital Public Good |

Don't show the disguise feature in public marketing. For the unlisted pitch video it's acceptable, and it's our
strongest safety-by-design proof. Decide as a team.

## Submission checklist

- [ ] Every TODO above resolved
- [ ] CC-BY-4.0 licence added for `content/`
- [ ] Returnee testing results recorded (field 25)
- [ ] Video uploaded to YouTube with English subtitles; link tested in a logged-out browser
- [ ] **Make the repo public.** GitHub lists `recite-labs/dada-link` as private; UNICEF needs it accessible (or grant @unicefinnovation access)
- [ ] Live site reachable (verified: yes, 7 Nov)
- [ ] Two different contact e-mails
- [ ] Submitted before 10 Nov to leave a buffer
