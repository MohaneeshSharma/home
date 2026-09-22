# Intent Document (v2.0)
## Confirmed Direction: Real Dynamic Site (DB + API) + Admin CRM

Version: 2.0 — supersedes v1.0's open "Option A vs Option B" question
Date: 2026-09-22
Context: `brd.md` / `plan.md` / `gaurdrail.md` scoped a static React rebuild. v1.0 of this document flagged that "dynamic" conflicts with a pure static build and left the rendering strategy open (Option A: rebuild-on-publish vs Option B: real backend). **The owner has now decided**: build a genuinely dynamic site — real database, real API — plus a dedicated **admin CRM** to manage all content (projects, blogs, certificates) without touching code.

---

## 1. Decision Confirmed

- v1.0 §5 **Option B is chosen**: this is a real server-backed dynamic application, not a static site with an auto-rebuild trigger.
- The current site is explicitly **fake-dynamic** (owner's own words, confirmed): `Project.json`/`Blogs.json`/`Certificates.json`/`Contact.json` are static files in the repo; `admin.html` has no auth and doesn't persist anything (it just `console.log`s an updated in-memory array for manual copy-paste). None of this carries forward.
- A **new, explicit requirement** is added on top of everything in v1.0: a proper **CRM (admin panel)** so the owner can create/edit/delete Projects, Blog posts, and Certificates directly from the browser, backed by a real database and a real authenticated API — no code change, no redeploy, no manual JSON editing.

## 2. Terminology: "CRM" in This Context

The owner asked for a "CRM" to manage content dynamically. Taken literally, CRM (Customer Relationship Management) is about managing customer/lead relationships, while what manages Projects/Blogs/Certificates content is technically a CMS (Content Management System). Business-requirements research for a solo portfolio site shows these two needs are small enough to **merge into one admin panel** rather than build/host two separate systems:

- **CMS function** (the owner's primary ask): manage Projects, Blog posts, Certificates.
- **CRM function** (a natural extension, and arguably the more literal reading of "CRM"): the Contact page today only offers `mailto:`/`tel:`/WhatsApp links — there is no record of who reached out. Once a real backend exists, capturing and tracking inbound inquiries (name, message, date, status: new/contacted/closed) is a near-zero-cost addition that makes "CRM" true in the literal sense too, and is genuinely useful for a freelance/portfolio site where every inquiry is a lead worth not losing track of.

**Recommendation**: build one unified **Admin Panel** with two areas — **Content** (CMS) and **Leads** (CRM) — rather than a content-only tool. This is called "the CRM" throughout the rest of this document per the owner's naming, but functionally covers both. Confirm scope in §8 if the Leads/inquiry-tracking piece is not wanted.

## 3. CRM / Admin Panel — Business Requirements (researched)

### 3.1 Core Modules

| Module | Purpose |
|---|---|
| **Dashboard** | At-a-glance overview on login: total projects, published vs draft blog posts, total certificates, new/unread leads count, recent activity. |
| **Projects manager** | Full CRUD for case studies: title, short/long description, cover image + gallery images, tags, external links, **slug** (for the public URL), status (draft/published), display order (for "Selected Work" ordering on Home). |
| **Blogs manager** | Full CRUD for posts: title, slug, summary, **rich-text body** (not raw HTML pasted by hand — see §3.3), cover image, author, tags, **status (draft/scheduled/published)**, published date, view count (the existing `Blogs.json` already has a `views` field — decide in §8 whether this becomes a real tracked counter). |
| **Certificates manager** | Full CRUD: title, issuing category (matches the current grouping on `certificate.html`), description, **PDF upload** (replacing today's manually-placed files in `assets/Certificates/`). |
| **Leads / Inquiries** (CRM proper) | List of contact-page submissions (if a real contact form is added per v1.0 §7 Q5): name, email/phone, message, received date, status (new/contacted/closed), notes field. |
| **Settings** | Editable site-level fields the owner currently has to hand-edit in HTML: resume PDF (replace/upload), social links, hero stats, "trusted by" logos — scope to be confirmed (could be minimal for v1, expanded later). |
| **Auth** | Single-admin login (email/password or magic link) gating the entire admin panel. No public sign-up. |

### 3.2 Functional Requirements (per module)

- **FR-C1**: Every content type (Project, Blog, Certificate) supports Create, Read, Update, Delete, and the public site reflects changes without a code deploy.
- **FR-C2**: Blog and Project records have a **draft/published** state; only `published` records are ever served to the public site/API — this gives the owner a safe way to prepare content before it goes live.
- **FR-C3**: Every content type has its own **SEO fields** (meta title, meta description, slug) editable in the admin panel — this directly extends the SEO work already planned in `plan.md`, so SEO isn't just a one-time build-time setup but something the owner can tune per post/project going forward.
- **FR-C4**: Image/file uploads (project images, certificate PDFs, blog cover images) go through a real upload flow with type/size validation — not "commit a file to the repo."
- **FR-C5**: The Blogs manager uses a **rich text / WYSIWYG editor** (e.g., a block or Markdown editor) instead of the current pattern of hand-writing raw HTML into a `content` JSON field — removes the XSS-prone raw-HTML-paste pattern flagged in `gaurdrail.md` §4 at the source, since the editor produces sanitized structured content rather than arbitrary pasted HTML.
- **FR-C6**: If Leads/CRM is in scope (see §2), every Contact-page form submission is stored and visible in the admin panel with a status the owner can update.
- **FR-C7**: Admin panel is **fully separate from and inaccessible without** authentication — replacing `admin.html`'s current zero-auth state, this is a hard requirement, not a nice-to-have (already a MUST in `gaurdrail.md` §4).
- **FR-C8**: Deleting a Project/Blog/Certificate should be a confirmed, soft-delete-or-archived action where reasonable (avoid one mis-click permanently destroying content with no recovery).

### 3.3 Non-Functional Requirements Specific to the CRM

- **Security**: server-side auth checks on every write endpoint (never trust a hidden admin route alone); rate-limit the login endpoint; sanitize/validate all incoming content server-side (extends `gaurdrail.md`'s sanitization guardrail from "the blog content field" to "every field coming from the admin panel's API").
- **Usability**: admin panel should be usable from a phone/tablet too (the owner may want to publish a blog post or check a new lead on the go) — responsive admin UI, not desktop-only.
- **Reliability**: uploads and content edits should give clear success/error feedback; no silent failures (a real regression from today's admin.html, which silently just logs to console).
- **Auditability (nice-to-have, not a blocker)**: basic "last updated" timestamps on every record are enough for v1; a full audit log/history is a possible future enhancement, not required now.

## 4. Updated Technical Architecture

This confirms and replaces v1.0 §5's open question with a concrete recommendation:

| Layer | Recommendation | Why |
|---|---|---|
| **Frontend framework** | **Next.js** (React, App Router) | Still React as originally requested; unlike the earlier `vite-react-ssg` static plan, Next.js natively supports **SSR/ISR**, so public pages stay fast and SEO-crawlable (title/meta/OG/JSON-LD present in real server-rendered HTML) while reflecting live database content — this is the piece that resolves v1.0's static-vs-dynamic conflict. |
| **Backend/API** | Next.js **API routes / Route Handlers** (no separate backend service needed) | Keeps one codebase/one deploy for both the public site and the admin CRM's API — appropriate for a single-owner portfolio, avoids over-engineering with a separate microservice. |
| **Database** | **PostgreSQL via Supabase** (managed) | Supabase bundles Postgres + Auth + File Storage + auto-generated APIs in one managed service — for a solo-owner project this cuts setup time significantly versus self-hosting Postgres + rolling custom auth + wiring S3 separately, while still being a "real" database (not a toy). Prisma (or Supabase's client) as the ORM/query layer for type-safe access from Next.js. |
| **Auth (admin login)** | **Supabase Auth** (email/password or magic link), a single admin user | Matches FR-C7; no need for a custom auth system or third-party identity provider for a one-person CRM. |
| **File storage** (images, certificate PDFs, resume) | **Supabase Storage** | Same platform as the DB/auth — one bill, one dashboard, avoids adding a second vendor (e.g. Cloudinary/S3) unless a specific need (image transforms/CDN) justifies it later. |
| **Rich text editor (blogs)** | **Tiptap** (or similar block/Markdown editor) | Produces structured, sanitizable content — satisfies FR-C5. |
| **Hosting** | **Vercel** (first-party Next.js host) + Supabase (DB/Auth/Storage) | Moves off GitHub Pages (which cannot run a backend) — this was already flagged as a consequence of "dynamic" in v1.0 §6; Vercel + Supabase is a well-trodden, low-ops pairing for exactly this kind of app. |
| **Domain** | Point `www.foxwise.in` at the new host | Same domain preserved, hosting provider changes (owner sign-off needed — this is the one infra change from `gaurdrail.md`'s "MUST NOT change domain/hosting without explicit request," now explicitly requested by going dynamic). |

## 5. Data Model Additions (high level)

Beyond the existing `Project`/`Blog`/`Certificate` shapes already documented in `brd.md` §3, the dynamic version adds:

- `status` (draft/published), `seo_title`, `seo_description`, `slug`, `created_at`, `updated_at` on every content type.
- `Lead`/`Inquiry` table: `name`, `contact_method` (email/phone), `message`, `status`, `notes`, `created_at` — only if the CRM/Leads scope from §2 is confirmed.
- `AdminUser`: managed by Supabase Auth, not a custom table.
- File references (image/PDF URLs) point to Supabase Storage objects rather than repo-relative paths.

## 6. Feature Parity (updated ownership)

Same feature list as `brd.md`/v1.0 of this document — every public page/feature is unchanged in what the visitor sees. What changes is **who edits it and how**:

| Content | Old way | New way |
|---|---|---|
| Projects | Hand-edit `Project.json` + HTML files, commit, deploy | Create/edit in the CRM → saved to Postgres → public pages update immediately (SSR/ISR) |
| Blogs | Hand-edit `Blogs.json` (and `Blogs.html` didn't even read it) | Rich-text editor in the CRM → draft/publish workflow → listing page always reflects real published posts |
| Certificates | Hardcoded in `certificate.html`, PDFs manually placed in repo | Upload PDF + fill form in the CRM → stored in Supabase Storage + DB |
| Leads (new) | None — no record of inquiries | Captured from Contact form (if added) into the CRM's Leads module |

## 7. Non-Goals (unchanged from v1.0)

- Visual design/branding/layout is not being redesigned — this is a data + admin-tooling change.
- `nyaysetu/` remains fully out of scope.
- No multi-user/team roles in the CRM — single admin (the owner) is sufficient unless stated otherwise.

## 8. Open Questions (narrower now that Option B is confirmed)

1. **Leads/CRM scope** — confirm the Contact page should get a real form that feeds the Leads module (§2), or keep Contact link-only and drop the CRM-proper (inquiry-tracking) part, keeping the admin panel to Content (CMS) only.
2. **Blog view counts** — `Blogs.json` already has a `views` field today (currently meaningless/static); should the dynamic version track real page views per post?
3. **Settings module scope** — is editing resume/social links/hero stats via the CRM wanted for v1, or is that an acceptable manual/code-level edit for now (keeps v1 scope smaller)?
4. **Notifications** — should a new Lead or a specific event (e.g., contact form submission) trigger an email notification to the owner, or is checking the CRM dashboard manually enough?
5. **Hosting/budget confirmation** — Vercel + Supabase both have generous free tiers suitable for a solo portfolio; confirm no objection before committing to this pairing over self-hosting.
6. Still-unresolved items carried from `brd.md`/v1.0: fate of `graphic.html`/`figma.html`/`index2.html`, and the canonical version of the duplicate project pages (`smartcity` vs `smartcityproto`, `S-touch` vs `stouchproto`).

## 9. Relationship to Other Documents

- `brd.md` — content/feature scope still valid; add the CRM/Leads module as a new functional area once §8 Q1 is answered.
- `plan.md` — **needs a revision pass**: replace the `vite-react-ssg` static-build section with the Next.js + Supabase architecture from §4 above; the component/page inventory (§3–4 of `plan.md`) is still reusable, but the "Data Layer Plan" (§5) and "Deployment Plan" (§10) sections are now outdated and should be rewritten to reflect a real API + database instead of build-time JSON imports.
- `gaurdrail.md` — all guardrails still apply and become *more* load-bearing now: the security section (§4) is no longer a hypothetical "if admin.html is rebuilt" — it is now an active requirement for the CRM being built.

**Next step**: once §8's open questions are answered, update `plan.md` (or create `plan-v2.md`) with the concrete Next.js + Supabase implementation plan, database schema, and API route list before implementation begins.
