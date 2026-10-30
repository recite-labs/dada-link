# DadaLink — Product Design (pivot of Damakese)

Status: agreed in brainstorming 2026-10-31. Target: UNICEF Femtech Ventures call 2 (deadline 11 Nov 2026, 23:59 CET).

## Why

Hundreds of thousands of African women — many of them adolescent girls — migrate to the Gulf and Lebanon as domestic workers. Under kafala they face confiscated passports, withheld wages, confinement, physical and sexual abuse, no access to sexual and reproductive health care, severe isolation and mental-health crises, and difficult return. Their (often hidden) phone is their lifeline. No trusted, safe, local-language companion exists across the journey.

UNICEF fit: Pillar 3 (mental wellbeing, safety, protection, GBV), Pillar 2 (SRH information in local languages), adolescent girls, emergency settings. Safety-by-design is a condition of investment.

## What

**DadaLink** ("dada" = sister) — a discreet companion for African women migrant domestic workers, across the whole journey. Pan-African brand; Ethiopia first (Amharic, Afaan Oromo, English; Swahili and Tigrinya next).

Channels: **Telegram bot** (discreet front door, nothing to install) + **Android app** (rebrand of the existing Damakese Play listing `me.kibru.damakese`; full safety features) + web.

### Phases (prototype scope, "whole journey, thin")

- **Before leaving:** licensed-agency check; contract & rights per destination (Saudi Arabia, UAE, Kuwait, Qatar, Lebanon, Jordan); health preparation (contraception, SRH, medical exam, legal risks abroad); trusted-contact setup.
- **Abroad (core):** AI assistant on reviewed content (health, SRH, mental health, rights, "what do I do if…"); per-country help directory (embassy/consulate, labour hotline, police, IOM, shelters; offline, one-tap call); SOS (location + message to trusted contact via SMS/Telegram); private encrypted log (wages, hours, incidents + photos, device-only); health tools (period, pregnancy, mood check-in).
- **Return:** mental-health check-in; returnee services directory; unpaid-wage claims guidance.
- **Later (not prototype):** community module ("sister circles") — existing community code stays dormant.

### Safety by design

Disguise mode (app appears as a calculator; launcher name/icon swap), quick exit, app PIN, no notification previews, logs device-only and encrypted, minimal server data, no tracking.

## How

Same monorepo (Hono API + D1, Astro web, Expo mobile). New API modules: assistant (Claude via Cloudflare AI Gateway, retrieval over reviewed content, safety rules, emergency escalation), help directory, journey content, agency checker, Telegram webhook. Web rebrands to DadaLink (new subdomain; damakese.recitelabs.com redirects). Repo `github.com/recite-labs/damakese` goes public under AGPL-3.0.

## Timeline

31 Oct–1 Nov brand, design, repo, AI Gateway, content outline · 2–5 Nov API + web · 4–6 Nov Android + Telegram · 7 Nov returnee testing · 8–9 Nov pitch video · 10 Nov form · 11 Nov buffer.

## Open items (user-owned)

AI Gateway billing; Dr. Helen content review; tester recruitment; partner outreach (IOM, Agar Ethiopia, Ministry of Labour and Skills); pitch video; team table.
