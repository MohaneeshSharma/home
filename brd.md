# Business Requirements Document (BRD)
## Project: Mohaneesh Sharma — Portfolio Website (Dynamic, Multi-Discipline, World-Class Standard)

Version: 2.0 — supersedes v1.0's static-migration framing; aligns with `intent.md` v3.0 (dynamic CMS+CRM, multi-discipline work, new domain)
Date: 2026-09-22
Author: Prepared with Claude Code from a full audit of the existing repository

**What's new in v2.0**: (1) clarifies that content today is split across static HTML pages **and** external platforms (Medium, LinkedIn) and sets the content-sourcing strategy accordingly; (2) adds an explicit **quality bar** — this portfolio is meant to read as the work of a **world-class UI/UX and graphic designer**, not a competent personal site, and that standard now shapes the functional and non-functional requirements below.

---

## 1. Purpose & Background

The current portfolio website (`www.foxwise.in`, moving to `www.mohaneesh.com` per `intent.md` v3.0) is a static, hand-written HTML/CSS/JS site with no real build pipeline, no working shared-component system, no SEO infrastructure, and — per `intent.md` — no real backend (JSON files masquerading as data, an unauthenticated non-persistent "admin" page).

The owner is rebuilding it as a **dynamic, database-backed application** (React/Next.js + Supabase, per `intent.md`) with a **CMS + CRM admin panel**, covering **three disciplines** (UI/UX design, graphic design, video editing) across **both job and freelance** positioning. This version of the BRD adds two things the earlier draft didn't fully account for:

1. **Where the content actually lives today** — not just the repo's static HTML/JSON, but also posts already published on **Medium** and **LinkedIn**.
2. **The bar this site needs to clear** — the owner's explicit ask is that the finished product should look, read, and perform like the portfolio of **the world's best UI/UX and graphic designer**, not a template-driven personal site. That's a standard, not a slogan, and §4 below breaks it into concrete, checkable requirements.

## 2. Current State Summary (from full repo audit)

| Area | Finding |
|---|---|
| Pages | index, About, Projects, Blogs, Detailed_blog (+ duplicate copy in `/blogs/`), contact, certificate, graphic, figma, admin, index2 |
| Styling | Tailwind via 3 inconsistent delivery methods; no shared config |
| Components | `components/header.html` exists but is unused — every page hardcodes its own nav |
| Data | `Project.json`, `Blogs.json` (25 posts, only partly used), `Certificates.json`/`Contact.json` orphaned |
| SEO | Missing meta descriptions on several pages; no canonical/OG/JSON-LD; stale `sitemap.xml`; no `robots.txt` |
| Contact | Link-only (`mailto:`/`tel:`/WhatsApp), no form, no lead capture |
| Admin | `admin.html` has zero auth and no real persistence |
| Orphan pages | `graphic.html` (now in scope, see `intent.md` v3.0), `figma.html`, `index2.html`, `admin.html` — decisions pending |
| Sub-project | `nyaysetu/` — separate, out of scope |

### 2.1 Content Source Reality — Static Pages + Medium + LinkedIn

This is the key addition in v2.0. The owner's actual writing/content footprint is **not fully captured in the repo**:

- **On-site (static HTML/JSON)**: project case studies (`Project.json` + `projects/*.html`), the 25 entries in `Blogs.json`, certificate records — this is what the earlier audit and `brd.md` v1.0 focused on.
- **Off-site — Medium**: `Blogs.html`'s hardcoded teaser cards already link out to **external Medium articles** — confirming the owner publishes long-form writing on Medium today, outside the repo entirely. This content does not exist as structured data anywhere in this project.
- **Off-site — LinkedIn**: the owner also publishes on LinkedIn (posts/articles) — again, not represented as structured content in the repo; only a LinkedIn *profile* link exists on the Contact page today.

**Implication**: a "same features, but dynamic and world-class" rebuild cannot treat `Blogs.json` as the full picture. The Blogs/Insights module's data requirements (§8) must account for content that currently lives on third-party platforms the owner doesn't control.

## 3. Business Goals & Objectives

1. **G1 — Credibility & discoverability**: recruiters/clients finding the site via search or shared links get a fast, polished, correct experience.
2. **G2 — Maintainability**: content changes happen through the CMS, not code edits (per `intent.md`).
3. **G3 — Performance**: fast, optimized, no dead weight (e.g. the unused 478KB Tailwind CDN script).
4. **G4 — Visual/brand consistency**: one design system across all three disciplines (UI/UX, graphic design, video).
5. **G5 — Content integrity**: no existing case study, blog post, certificate, or CTA lost without sign-off.
6. **G6 — World-class craft (new)**: the finished site should be portfolio-of-record quality — the kind of site that itself functions as a UI/UX and graphic design *work sample*, since for a designer, the portfolio site **is** a deliverable, not just a container for other deliverables. See §4.
7. **G7 — Owned content (new)**: the owner's best writing (currently scattered on Medium/LinkedIn) should live natively on the owner's own domain as the canonical source, with external platforms used for distribution/reach — not the other way around. See §8.1.

## 4. Quality Bar: "World's Best UI/UX & Graphic Designer" Standard

Research basis: top-tier design portfolios (Awwwards/CSS Design Awards honorees, Dribbble/Behance-featured designers, well-known independent UI/UX and graphic-design portfolios) consistently share a specific set of traits. This section translates that pattern into concrete, buildable requirements — not vague inspiration — so it can actually be checked against, not just aspired to.

| Trait of elite portfolios | What it means for this rebuild |
|---|---|
| **The site itself is a design artifact** | Every screen — including admin-generated blog/case-study pages — must reflect intentional layout, type, spacing, and motion choices, not default component styling. This is a stricter bar than "looks nice": it means design review happens on the *rebuilt site itself*, not just on the projects it showcases. |
| **Case studies tell a story, not just show screenshots** | Each project (across all three categories from `intent.md` §2) should follow a **Problem → Process → Decisions → Outcome/Impact** structure with real specifics (role, timeline, tools, and — where possible — measurable outcomes), not a screenshot gallery with a paragraph of description. This is a content requirement for the CMS's project form, not just a template requirement. |
| **Purposeful motion & micro-interactions** | Scroll-triggered reveals, hover states, page transitions — present, but performance-budgeted (must not compromise the Lighthouse Performance ≥ 90 target already set in `plan.md`/`gaurdrail.md`). Motion should support storytelling (e.g., revealing a before/after), not be decorative noise. |
| **A distinct, consistent visual voice** | One type scale, one color system, one spacing system applied consistently across UI/UX case studies, graphic design galleries, and video work — this directly reinforces `intent.md`'s multi-discipline IA recommendation (one Work section, category-filtered) rather than three visually disconnected sub-sites. |
| **Credibility signals** | Client/employer logos (already present — Subharti University, 010 Softwares, Pactap), testimonials (already present on About), and — new — space for **press/feature mentions, awards, or notable publication credits** if any exist now or later (e.g., a Medium piece that performed well, a LinkedIn post that got traction) should have a place to be surfaced, not buried. |
| **Writing quality signals expertise** | Blog/Insights content should be substantive, native to the site (see §8.1), and well-edited — quantity (25 stale JSON entries) is worth less than a smaller set of genuinely good, correctly-migrated pieces. |
| **Technical excellence is part of the craft** | For a designer's own portfolio, slow load times or broken responsive behavior are not neutral bugs — they contradict the claim of design skill. This elevates `plan.md`/`gaurdrail.md`'s existing performance/accessibility targets from "good practice" to "core credibility requirement." |
| **Nothing feels templated or generic** | No unstyled default components, no placeholder Lorem Ipsum in the shipped product, no visibly unfinished sections (e.g., today's dead search bar on `Blogs.html`, or the orphaned `graphic.html` inconsistency) — everything visible must be intentional and finished. |

**How this is enforced**: §4's traits become acceptance criteria alongside §11's metrics — a page is not "done" when it matches the old static site's content; it's done when it also clears this bar. `gaurdrail.md` should get a corresponding "Design Quality" guardrail section referencing this table.

## 5. Stakeholders

- **Owner / decision-maker**: Mohaneesh Sharma (mohaneesh.uiux@gmail.com) — designer, content author, final approver.
- **End users**: Recruiters, hiring managers, freelance/creative clients (job + freelance, per `intent.md`), and search engines.

## 6. Scope

### 6.1 In scope
- Home, About, Work/Projects (UI/UX + Graphic Design + Video Editing, per `intent.md` §2), Blogs/Insights, Certificates, Contact, Resume download.
- CMS + CRM admin panel (per `intent.md`).
- SEO infrastructure (meta, sitemap, robots, OG, JSON-LD) on the new domain `www.mohaneesh.com`.
- **Content migration strategy for Medium/LinkedIn posts** (new — see §8.1).

### 6.2 Needs owner decision before build starts
- `figma.html`, `index2.html` — likely excluded (non-portfolio content).
- Duplicate project drafts (`smartcity` vs `smartcityproto`, `S-touch` vs `stouchproto`) — canonical version to confirm.
- `Certificates.json`/`Contact.json` — resurrect via CMS or drop as dead weight (largely resolved: CMS now owns this data per `intent.md`).
- **Medium/LinkedIn content**: full republish on-site vs. continue linking out vs. hybrid (§8.1) — owner's call, with a recommendation given below.
- Exact taxonomy/finer categories within graphic design and video (per `intent.md` §8 Q3).

### 6.3 Out of scope
- `nyaysetu/` — separate product.
- Any backend work beyond what `intent.md`'s CMS+CRM architecture requires.

## 7. Functional Requirements

(Carried forward from v1.0, plus new/updated items marked **NEW**)

| ID | Requirement |
|---|---|
| FR1 | Shared `<Header>`/`<Nav>`/`<Footer>` on every page. |
| FR2 | Home page sections driven by real CMS data, not hardcoded content. |
| FR3 | Work/Projects listing renders from the CMS, filterable by discipline (UI/UX / Graphic Design / Video Editing per `intent.md`). |
| FR4 | Each project has its own case-study page, following the Problem→Process→Decisions→Outcome structure from §4. |
| FR5 | Blogs/Insights listing renders from real, CMS-owned data (fixes the current hardcoded/out-of-sync `Blogs.html` bug). |
| FR6 | Blog detail page renders sanitized rich content by id/slug. |
| FR7 | Certificates page is CMS-driven with PDF viewer/modal. |
| FR8 | Contact page keeps existing CTAs; gains a real form feeding the CRM's Leads module (per `intent.md` v3.0), with a job-vs-freelance inquiry type. |
| FR9 | Resume PDF downloadable from Home (and ideally About/Contact). |
| FR10 | Proper 404 page. |
| FR11 | `sitemap.xml`/`robots.txt` generated from the real route list, targeting `www.mohaneesh.com`. |
| **FR12 (NEW)** | The Blogs/Insights module supports **migrating existing Medium and LinkedIn post content** into the CMS as native, owned entries (see §8.1 for the recommended approach), rather than only linking out to third-party URLs. |
| **FR13 (NEW)** | Where a piece of content originated on Medium/LinkedIn and is republished natively, the page includes a visible "originally published on Medium/LinkedIn" attribution/link (good practice, and avoids the appearance of erasing where it was first shared) and a `rel=canonical`/cross-posting-safe SEO setup so it isn't penalized as duplicate content. |
| **FR14 (NEW)** | Every project/case-study/blog page meets the qualitative bar in §4 before being considered complete — this is a functional gate on "done," not just a style suggestion. |

## 8. Non-Functional Requirements

- **NFR1 — SEO**: unique title/description/canonical/OG/JSON-LD per page; content must be crawlable (real static/SSR HTML, per `intent.md`'s Next.js recommendation), targeting `www.mohaneesh.com`.
- **NFR2 — Performance**: Lighthouse Performance/SEO/Accessibility/Best-Practices ≥ 90 mobile; optimized images; no CDN-script bloat.
- **NFR3 — Accessibility**: WCAG 2.1 AA baseline.
- **NFR4 — Responsiveness**: full parity across breakpoints.
- **NFR5 — Maintainability**: one design system, CMS-driven content, no duplicated config.
- **NFR6 — Security**: sanitized rendered content, authenticated CMS/CRM (per `intent.md`).
- **NFR7 — Hosting continuity**: deploys to the new domain per `intent.md` §4; old-domain redirect handling per that document's open question.
- **NFR8 — Design craft (NEW)**: every shipped page is held to the §4 quality bar — this is treated as a non-functional acceptance gate equal in weight to performance/accessibility, not a "nice to have."

## 9. Data Requirements

### 9.1 Content Migration Strategy (Medium & LinkedIn) — Recommendation

Given G7 (owned content) and the SEO work already planned, the recommended approach is a **hybrid**:

1. **Republish full content natively** in the site's own Blogs/Insights CMS module as the canonical version (best for SEO — content lives on the owner's own domain and benefits it directly; best for UX — no bounce to a third-party site; best for the "world-class" bar in §4 — a visitor exploring the site's writing doesn't get redirected away mid-experience).
2. **Keep a visible attribution link** back to the original Medium/LinkedIn post (per FR13) — preserves any existing engagement/comments on those platforms and is standard, honest practice for republished content.
3. **Continue cross-posting new writing to Medium/LinkedIn** for distribution/reach after or alongside publishing natively on-site, with a canonical tag pointing to the on-site version to avoid duplicate-content SEO issues.
4. **Practical step**: the owner will need to supply the existing Medium/LinkedIn post content (export, copy-paste, or links to migrate from) since neither platform's content exists in this repo today — this is a real content-gathering task, not just an engineering one, and should be scheduled into the project plan.

(Owner sign-off needed on this approach — see §11 Open Questions.)

### 9.2 Other Data
- `Project.json`/`Blogs.json` are real sources of truth for what's already structured; migrate into the CMS's database per `intent.md`.
- `Certificates.json`/`Contact.json`: CMS now owns this (superseded by `intent.md`'s CMS module — no longer "delete or resurrect," just "build properly").
- Certificate PDFs and project images carry over as assets (uploaded via CMS per `intent.md`); `mentora` screenshots should be reviewed/compressed.

## 10. Success Metrics / Acceptance Criteria

- All in-scope pages exist with 1:1-or-better content parity with the current live site **and** clear the §4 quality bar.
- Lighthouse SEO ≥ 95, Performance ≥ 90 (mobile) on Home, Work, and a sample case study.
- Google Search Console successfully indexes key pages on the new domain.
- No hardcoded/duplicated nav; single shared components.
- No broken asset paths (known bugs from the original audit fixed).
- CMS/CRM functioning: content changes reflect on the live site without a code deploy; leads are captured and visible.
- **At least the highest-value existing Medium/LinkedIn posts are migrated natively** (exact count/priority to be set with the owner) with correct attribution and canonical SEO handling.
- A reviewer unfamiliar with the project, shown the finished site cold, should be able to tell it was built by someone who takes UI/UX and graphic design seriously — this is deliberately qualitative and is the practical test of §4's bar, meant to be checked via a real design review pass before launch, not just automated metrics.

## 11. Assumptions & Open Questions

- Assumption: hosting stays static/serverless-friendly (Vercel + Supabase per `intent.md`) — no heavier backend introduced beyond that.
- **Open question (NEW)**: confirm the hybrid Medium/LinkedIn migration approach in §9.1 — does the owner want *all* existing posts migrated natively, only a curated subset, or none (keep purely as external links as today)?
- **Open question (NEW)**: can the owner export/provide the existing Medium and LinkedIn post content (text, images, dates) for migration, and roughly how many pieces are we talking about?
- Open question (carried): fate of `figma.html`/`index2.html`, and the canonical duplicate project pages.
- Open question (carried from `intent.md`): domain readiness, video platform choice, finer category taxonomy.
