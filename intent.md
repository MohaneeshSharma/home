# Intent Document
## From "Static Portfolio" → "Same Features, but Dynamic"

Version: 1.0
Date: 2026-09-22
Context: Builds on the earlier audit/plan (`brd.md`, `plan.md`, `gaurdrail.md`), which scoped a **static** React rebuild (Vite + `vite-react-ssg`). This document captures the owner's updated intent: keep the exact same feature set and pages, but make the site **dynamic** instead of static.

---

## 1. Owner's Stated Intent (in their own words)

> "Same features ke sath dynamic banani hai" — Rebuild the current static portfolio with the **same features**, but as a **dynamic** site instead of hardcoded static HTML/JSON.

## 2. What "Dynamic" Means Here (clarified from repo audit)

Today, "dynamic-looking" content is actually **fake-dynamic**: JSON files (`Project.json`, `Blogs.json`, `Certificates.json`, `Contact.json`) sit in the repo and are either `fetch()`-ed client-side or, in several places, not even read at all (`Blogs.html` hardcodes 3 posts instead of reading the 25 in `Blogs.json`; `certificate.html` hardcodes its list instead of reading `Certificates.json`). The only "admin" tool (`admin.html`) edits an **in-memory array** and `console.log`s the result for the owner to hand-paste back into the JSON file — there is no real database, no API, and no auth.

**Dynamic**, for this rewrite, means:
- Content (projects, blog posts, certificates, and optionally testimonials/timeline/stats) lives in a **real database**, not static JSON files committed to the repo.
- Content is served through a **real API**, not a build-time-baked data import.
- The site owner can **add/edit/delete** a project, blog post, or certificate **without a code change or redeploy** — through a proper authenticated admin panel that actually persists.
- The **public-facing pages still need to be fast and SEO-indexable** (this was the whole point of the SEO work already planned in `plan.md`) — "dynamic" must not mean "regressing to a slow, unindexable client-side-only app." This is the central engineering tension this document flags (see §5).

## 3. Feature Parity — What Must Carry Over Unchanged

Per the full repo audit already captured in `brd.md`, every in-scope feature must still exist, now backed by real data instead of static files:

| Feature (today) | Dynamic version |
|---|---|
| Home hero, stats, "trusted by" logos, expertise grid | Same UI; stats/logos can stay static content or become editable fields — owner to decide (see open questions). |
| Selected Work section (hardcoded on Home) | Pulled dynamically from the same Projects data source used on `/projects`. |
| Projects listing + individual case study pages | Projects stored in DB, served via API, rendered as before. |
| Blogs listing + blog detail page | Blog posts stored in DB; listing page actually reflects all published posts (fixes today's hardcoded/out-of-sync bug); detail page fetches by id/slug from the API. |
| Certificates page + PDF viewer modal | Certificates stored in DB (fixes today's orphaned-JSON bug) with PDF files stored as real uploaded assets (not just repo files). |
| Contact page (WhatsApp/tel/mailto/LinkedIn) | Same CTAs kept; optionally a **real contact form** that writes a "lead"/message to the database (this was optional/future in `plan.md` — "dynamic" makes it a natural fit now, to be confirmed). |
| Resume/CV PDF download | Unchanged — static asset download. |
| `admin.html` (currently unauthenticated, non-persistent) | Rebuilt as a **real, authenticated admin panel** with actual create/update/delete against the database — this is the single biggest functional gap being closed. |

Everything flagged as "needs owner decision" in `brd.md` §5.2 (`graphic.html`, `figma.html`, `index2.html`, duplicate project drafts) carries the **same open status** here — going dynamic doesn't resolve those; it only affects data that's genuinely content (projects/blogs/certificates).

## 4. Non-Goals (explicitly NOT changing)

- Visual design, layout, branding, and page structure stay as-is — this is a data/architecture change, not a redesign.
- `nyaysetu/` remains out of scope, as in `brd.md`.
- No change to the custom domain (`www.foxwise.in` / `CNAME`) unless the new hosting model requires it (flagged in §6).

## 5. Key Technical Implication: This Changes the Stack Decision in `plan.md`

`plan.md` recommended **`vite-react-ssg`** — a **build-time static site generator**. That choice assumed the data (`projects.ts`, `blogs.ts`) was fixed at build time. It directly conflicts with "dynamic": if content lives in a database and can change anytime without a redeploy, a pure static-generation approach means the owner would have to **trigger a rebuild every time they add a blog post** — workable, but not truly dynamic, and it's worth naming explicitly rather than leaving implicit.

Two realistic paths, to be decided with the owner before implementation starts:

| Option | How it works | Trade-off |
|---|---|---|
| **A — Rebuild-on-publish (stays close to current plan)** | Keep `vite-react-ssg`, but the admin panel writes to a DB and triggers a rebuild/redeploy (e.g., via a webhook to a CI/CD pipeline) whenever content changes. | Simple hosting (still static output), still excellent SEO, but "dynamic" is really "static + auto-rebuild" — a short delay between publishing and it going live. |
| **B — True server-rendered dynamic app** (likely the better fit for "dynamic") | Move to **Next.js** (still React, as originally requested) with a real backend API + database, using SSR or ISR (Incremental Static Regeneration) so pages are still fast and SEO-friendly but reflect live data without a full redeploy, and add authenticated API routes for the admin panel. | Needs real hosting (not GitHub Pages — a Node-capable host like Vercel/Render/Railway) and a real database, but delivers genuine dynamic behavior + keeps SEO strong. |

This document does not pick one on the owner's behalf — it flags that **the earlier plan.md needs to be revisited/updated** once the owner confirms they want Option A or Option B, since it materially changes hosting, backend, and database requirements.

## 6. New Requirements Introduced by "Dynamic" (not present in the original static plan)

- **Database**: needed to store projects, blog posts, certificates, and (if added) contact messages/leads. (e.g., Postgres/MySQL/SQLite via an ORM such as Prisma, or a managed BaaS like Supabase/Firebase — to be decided.)
- **API layer**: CRUD endpoints for each content type, consumed by both the public pages and the admin panel.
- **Authentication**: the admin panel **must** be behind real login (this was already a hard guardrail in `gaurdrail.md` §4 — "MUST NOT ship `admin.html`'s current pattern... If an admin/editing UI is rebuilt, it MUST have real authentication"). Going dynamic makes this requirement active rather than hypothetical.
- **File/asset storage**: certificate PDFs and project images need a real upload mechanism (not "drop a file in the repo") if the admin panel is meant to let the owner add new projects/certificates without a developer's help.
- **Hosting change**: static hosting (GitHub Pages) cannot run a database-backed API — hosting will need to move to a platform that supports a backend (see Option B above), or Option A's rebuild-on-publish keeps static hosting but adds a CI/CD trigger.
- **Content sanitization & validation**: now doubly important — user-entered content (via the admin panel) flowing into the public site must be validated and sanitized server-side, not just client-side (extends the existing `dompurify` guardrail to the API layer too).

## 7. Open Questions for the Owner (block implementation until answered)

1. **Option A vs. Option B (§5)** — auto-rebuild-on-publish vs. a true server-rendered dynamic app (Next.js + DB)? This is the single biggest decision and changes hosting, cost, and complexity.
2. **Database choice** — managed BaaS (e.g., Supabase/Firebase — fastest to build, less infra to manage) vs. self-hosted DB + custom API (more control, more setup)?
3. **Hosting** — willing to move off GitHub Pages if Option B is chosen? Any budget/platform preference (Vercel, Render, Railway, etc.)?
4. **Admin auth** — simple single-owner login (email/password or magic link) is likely sufficient (this isn't a multi-user CMS) — confirm that's all that's needed, no multi-role/team access.
5. **Contact form** — now that a backend exists, should the Contact page gain a real form that saves messages to the database (in addition to today's WhatsApp/tel/mailto/LinkedIn links)?
6. Everything already open in `brd.md` §5.2 (`graphic.html`, `figma.html`, `index2.html`, duplicate project pages, `nyaysetu/`) — still unresolved, independent of the dynamic decision.

## 8. Relationship to Existing Documents

- `brd.md` — the feature/content audit and business goals remain valid and are the source of truth for **what** the site must contain.
- `plan.md` — the frontend framework choice (React) and SEO intent (per-page meta/OG/JSON-LD, real crawlable HTML) remain valid, but its **rendering strategy** (`vite-react-ssg`, static-only) needs to be revisited once §5's Option A/B is decided; the component/page inventory and migration mapping in `plan.md` §3–4 stay reusable regardless of which option is chosen.
- `gaurdrail.md` — all existing guardrails still apply; §4 (Security) becomes stricter and immediately relevant now that a real API and database exist (server-side validation, real auth, no unauthenticated write endpoints).

**Next step**: once the owner answers §7, `plan.md` should be updated (or a `plan-v2.md` added) with the concrete backend/database/hosting architecture before implementation begins.
