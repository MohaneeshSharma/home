# Business Requirements Document (BRD)
## Project: Mohaneesh Sharma — Portfolio Website React Migration

Version: 1.0
Date: 2026-09-21
Author: Prepared with Claude Code from a full audit of the existing repository

---

## 1. Purpose & Background

The current portfolio website (`www.foxwise.in`) is a static, hand-written HTML/CSS/JS site (11+ pages) styled with the Tailwind **Play CDN / browser-JIT script**, with no real build pipeline, no shared component system in practice, and no SEO infrastructure (no meta descriptions on several pages, no Open Graph tags, no canonical tags, no structured data, no `robots.txt`).

The owner (a UX/UI Designer) wants the site **rebuilt in React** so that:
- The codebase is **component-based** — shared UI (header, footer, cards, nav) is written once and reused, instead of being copy-pasted across 11 files.
- The site becomes **well optimized** (smaller/controlled bundle, real Tailwind build instead of the 478KB Play CDN script, image optimization, lazy loading).
- Because this is a **portfolio site whose entire value depends on being found and read by recruiters/clients via search engines**, the rebuild must ship with an **SEO-friendly setup** from day one, not bolted on later.

## 2. Current State Summary (from full repo audit)

| Area | Finding |
|---|---|
| Pages | index, About, Projects, Blogs, Detailed_blog (+ duplicate copy in `/blogs/`), contact, certificate, graphic, figma, admin, index2 |
| Styling | Tailwind via 3 different, inconsistent delivery methods (local Play CDN script, `cdn.tailwindcss.com`, and an unused local build in `nyaysetu/`); no shared Tailwind config |
| Components | `components/header.html` + `load-header.js` exist but are **not actually used by any page** — every page hardcodes its own nav markup |
| Data | `Project.json` (used), `Blogs.json` (25 posts, only used by the detail page — the listing page `Blogs.html` is hardcoded and out of sync), `Certificates.json` and `Contact.json` (both orphaned/unused) |
| SEO | No meta description on index/About/Projects/graphic; no canonical/OG/JSON-LD anywhere; `robots.txt` missing; `sitemap.xml` references files that don't exist or are mis-cased |
| Contact | No `<form>` anywhere — contact page is `mailto:` / `tel:` / WhatsApp link only |
| Admin | `admin.html` is an unauthenticated, non-persistent blog editor (mutates an in-memory array and console.logs it) — not production-safe |
| Orphan pages | `graphic.html`, `figma.html`, `index2.html`, `admin.html` are not linked from nav or sitemap — likely leftovers, need an in/out decision |
| Sub-project | `nyaysetu/` is a large, independent legal-tech prototype with its own Tailwind build and a Postgres schema — **not part of the personal portfolio** and out of scope unless the owner says otherwise |
| Known bugs | `assets/css/inter.css` path is broken on 6+ pages (real file is at repo root `/inter.css`); `Detailed_blog.html` renders JSON `content` via raw `innerHTML` (XSS risk if content is ever user-editable) |

## 3. Business Goals & Objectives

1. **G1 — Credibility & discoverability**: Recruiters/clients searching the owner's name, skills, or case studies should find the site easily on Google, with rich, correct previews when shared (LinkedIn, WhatsApp, etc.).
2. **G2 — Maintainability**: Adding a new project, blog post, or certificate should require touching one data file / one component, not editing markup in multiple HTML files.
3. **G3 — Performance**: Fast load on mobile (recruiters often open links from LinkedIn on phones); no more shipping a 478KB unused Tailwind compiler to the browser.
4. **G4 — Visual/brand consistency**: One design system (colors, type scale, spacing) instead of a duplicated, drifting `tailwind.config` per page.
5. **G5 — Content integrity**: No existing case study, blog post, certificate, or CTA should be silently lost in the migration without the owner's sign-off.

## 4. Stakeholders

- **Owner / decision-maker**: Mohaneesh Sharma (mohaneesh.uiux@gmail.com) — site owner, content author, final approver.
- **End users**: Recruiters, hiring managers, potential clients, and search engine crawlers.

## 5. Scope

### 5.1 In scope (default — confirmed content of the live portfolio)
- Home (index)
- About
- Projects (listing) + individual case study pages (121vibes, S-touch, mentora, subhartian; `smartcity`/`smartcityproto` and `stouchproto` to be reviewed as likely duplicate drafts)
- Blogs (listing) + Blog detail page (dynamic, by id)
- Certificates page
- Contact page
- Resume/CV download (PDF)
- SEO infrastructure: meta tags, sitemap, robots.txt, Open Graph, structured data

### 5.2 Needs owner decision before build starts
- `graphic.html` ("Visuals & Content" sub-portfolio) — include as a real nav page, or drop?
- `figma.html` (internal "Figma Plans Comparison" doc) — not portfolio content; likely **excluded**.
- `index2.html` (AQAR university report, unrelated content) — likely **excluded**.
- `admin.html` — rebuild properly (with auth + real persistence, e.g. a headless CMS or simple backend) as an editing tool, or **drop entirely** and edit JSON/CMS content by hand/PR?
- `Certificates.json` / `Contact.json` — currently orphaned; either wire them up for real or remove.
- Duplicate/near-duplicate project case studies (`smartcity` vs `smartcityproto`, `S-touch` vs `stouchproto`) — which is canonical?

### 5.3 Out of scope
- `nyaysetu/` sub-project — separate product, separate scope/BRD if it is ever migrated.
- Any real backend/database work (contact form backend, CMS backend) is out of scope unless explicitly requested — default plan keeps the site static/serverless.

## 6. Functional Requirements

| ID | Requirement |
|---|---|
| FR1 | Shared `<Header>`/`<Nav>` and `<Footer>` React components rendered on every in-scope page, with active-link highlighting and a working mobile menu. |
| FR2 | Home page: hero, stats, "trusted by" logos, expertise grid, selected-work section (project cards), blog preview carousel, footer CTA — content-driven from data files where it makes sense (project cards from `Project.json`, not hardcoded). |
| FR3 | Projects listing page reads from a typed data source (JSON or TS module) and renders cards; each card links to its case-study route. |
| FR4 | Each project case study is its own route/page (kept as rich, mostly-static content, since these are long-form case studies). |
| FR5 | Blogs listing page must actually render from `Blogs.json` (fixing the current hardcoded/out-of-sync bug), with working search/filter if the search bar is retained. |
| FR6 | Blog detail page renders a post by id/slug from `Blogs.json`; any HTML content field must be sanitized before rendering (no raw `dangerouslySetInnerHTML` without sanitization). |
| FR7 | Certificates page lists all certificates with a PDF viewer/modal; content should come from one source of truth (fix the `Certificates.json` vs hardcoded-HTML mismatch). |
| FR8 | Contact page: WhatsApp, phone, email, LinkedIn CTAs preserved; a real contact form is optional/future (out of scope by default — confirm with owner if desired). |
| FR9 | Resume PDF remains downloadable from the Home hero (and ideally also from About/Contact). |
| FR10 | 404 page for unmatched routes (does not exist today — new requirement for a proper SPA/SSG build). |
| FR11 | `sitemap.xml` and `robots.txt` are generated correctly from the real route list at build time, not hand-maintained. |

## 7. Non-Functional Requirements

- **NFR1 — SEO**: Every page must have a unique `<title>`, meta description, canonical URL, Open Graph + Twitter Card tags, and (for the home and case-study pages) JSON-LD structured data (`Person`, `CreativeWork`/`Article` as applicable). Content must be crawlable/indexable — pure client-side-rendered React without pre-rendering is **not acceptable** for a portfolio site (see plan.md for the technical approach).
- **NFR2 — Performance**: Target Lighthouse Performance/SEO/Accessibility/Best-Practices scores of 90+ on mobile; images served as optimized WebP with lazy loading; no shipping the Tailwind Play CDN script to production.
- **NFR3 — Accessibility**: WCAG 2.1 AA baseline — semantic HTML, alt text on all images, sufficient color contrast, keyboard-navigable nav/menu/modal.
- **NFR4 — Responsiveness**: Full parity across mobile/tablet/desktop breakpoints (site is already mobile-first Tailwind; must not regress).
- **NFR5 — Maintainability**: One Tailwind config, one design-token set, no per-page duplicated config or CSS.
- **NFR6 — Security**: Any HTML rendered from data (blog content) must be sanitized; no secrets/API keys committed; if `admin.html` is rebuilt, it must be properly authenticated.
- **NFR7 — Hosting continuity**: Final build must deploy to the existing custom domain (`www.foxwise.in`, per `CNAME`) with no broken links relative to today's URLs where reasonably possible (or with redirects for changed paths).

## 8. Data Requirements

- `Project.json`, `Blogs.json` are the real sources of truth and should be migrated as typed data (or kept as JSON consumed by typed loaders).
- `Certificates.json` and `Contact.json`: owner to decide — resurrect (wire up certificate cards from JSON) or delete as dead weight.
- Certificate PDFs (`assets/Certificates/*.pdf`) and project images (`assets/images/*`, `projects/assets/images/mentora/*`) carry over as static assets; mentora screenshots should be reviewed/compressed (currently large, unoptimized raw screenshots).

## 9. Success Metrics / Acceptance Criteria

- All in-scope pages exist as React routes with 1:1 (or better, sign-off'd) content parity with the current live site.
- Lighthouse SEO score ≥ 95, Performance ≥ 90 (mobile) on Home, Projects, and a sample case study.
- Google Search Console can successfully index the key pages (verified post-launch via a fetch/render test or a prerendered HTML check).
- No hardcoded/duplicated nav markup remains — header/footer are single shared components.
- No broken asset paths (the known `inter.css` bug and similar issues fixed).
- Site builds and deploys via a single `npm run build` producing a static, deployable output.

## 10. Assumptions & Open Questions

- Assumption: Hosting remains static (GitHub Pages or similar static host) — no server/backend is introduced unless the owner asks for a real contact form or CMS backend.
- Open question: Should the contact page get a real form (e.g., via a form-as-a-service provider) or stay link-only?
- Open question: Fate of `admin.html`, `graphic.html`, `figma.html`, `index2.html` (see §5.2).
- Open question: Canonical project case study for the duplicate-looking `smartcity`/`stouchproto` files.
