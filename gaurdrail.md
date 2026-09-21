# Guardrails
## React Migration — Mohaneesh Sharma Portfolio

Version: 1.0
Companion to: `brd.md`, `plan.md`

These are the rules the implementation must follow. Anything marked **MUST** blocks a phase from being considered done; anything marked **MUST NOT** is a hard stop that needs the owner's explicit sign-off to override.

---

## 1. Content & Scope Guardrails

- **MUST NOT** silently drop any in-scope page, project case study, blog post, or certificate from `brd.md` §5.1 without the owner's explicit sign-off.
- **MUST NOT** migrate `graphic.html`, `figma.html`, `index2.html`, or `admin.html` until the owner has answered the open questions in `brd.md` §5.2 — build them out of the default route list until then.
- **MUST NOT** migrate both `smartcity`/`smartcityproto` and both `S-touch`/`stouchproto` as separate live routes — confirm the canonical file with the owner first; the other is reference-only.
- **MUST NOT** touch or migrate `nyaysetu/` as part of this work — it is a separate sub-project (out of scope per BRD).
- **MUST** preserve the resume PDF, all certificate PDFs, and the `CNAME` (`www.foxwise.in`) exactly — these are real external-facing assets/links.

## 2. Architecture & Code Quality Guardrails

- **MUST** use a single shared `<Header>`/`<Nav>`/`<Footer>` component set — **MUST NOT** reintroduce copy-pasted nav markup per page (this is the exact problem being fixed).
- **MUST** use one Tailwind theme/config — **MUST NOT** duplicate `tailwind.config`-style objects or custom `.bg-primary`/`.text-primary` classes per page.
- **MUST NOT** ship the Tailwind Play CDN script (`tailwind.min.js` / `cdn.tailwindcss.com`) in the production build — Tailwind must be compiled at build time.
- **MUST** keep components small and single-purpose (a `ProjectCard` renders a card; it does not also own routing or data-fetching logic) — no God components.
- **MUST NOT** add abstractions, config options, or "just in case" flexibility beyond what the current 11-page site actually needs (e.g., no generic CMS layer unless the owner asks for one).
- **MUST** type the data layer (`projects`, `blogs`, `certificates`) — no untyped `any`-shaped JSON consumed ad hoc in components.

## 3. SEO Guardrails (non-negotiable given this is a portfolio site)

- **MUST** ensure every page ships with a real static HTML `<title>` and meta description **in the actual build output** (verified via "view source", not devtools) — CSR-only output that leaves these empty is a failed build.
- **MUST** include canonical, Open Graph, and Twitter Card tags on every page.
- **MUST** generate `sitemap.xml` and `robots.txt` from the real, live route list at build time — **MUST NOT** hand-maintain a sitemap that can drift out of sync with actual routes (this is the exact bug found in the current site).
- **MUST NOT** reference non-existent or mis-cased file paths in the sitemap (carry-forward of the current `Certificates.html`/`projects/Detail_project.html` bugs is not acceptable).
- **MUST** add `Person`/`CreativeWork`/`BlogPosting` JSON-LD where specified in `plan.md` §6.
- Target Lighthouse SEO score ≥ 95 as an acceptance gate before calling the migration done.

## 4. Security Guardrails

- **MUST** sanitize any HTML rendered from data (`Blogs.json` `content` field) using a library such as `dompurify` — **MUST NOT** carry forward the current raw `innerHTML` pattern unsanitized.
- **MUST NOT** ship `admin.html`'s current pattern (no auth, mutates an in-memory array, no real persistence) as-is. If an admin/editing UI is rebuilt, it **MUST** have real authentication before it is deployed publicly.
- **MUST NOT** commit any API keys, tokens, or credentials to the repo, even for optional integrations (e.g., a future contact-form service).
- **MUST** review any new npm dependency before adding it (check maintenance status, bundle size, no unnecessary transitive bloat) — keep the dependency list lean, matching the site's actual needs.

## 5. Performance Guardrails

- **MUST NOT** regress load performance versus a reasonable modern baseline — target Lighthouse Performance ≥ 90 (mobile) on Home, Projects, and a sample case study.
- **MUST** lazy-load below-the-fold images and compress/convert oversized assets (the `mentora` screenshot set flagged in the audit) before shipping.
- **MUST NOT** introduce heavy, unnecessary libraries where a lighter option covers the need (e.g., prefer `lucide-react`/`react-icons` over a full Font Awesome kit if bundle size becomes an issue — confirm visual parity with the owner first).

## 6. Accessibility Guardrails

- **MUST** meet WCAG 2.1 AA basics: semantic HTML landmarks, alt text on every image, sufficient color contrast, full keyboard operability of nav/mobile-menu/PDF modal.
- **MUST NOT** rely on color alone to convey state (e.g., active nav link) — pair with an additional visual/semantic cue.

## 7. Process Guardrails

- **MUST** keep `brd.md` / `plan.md` / this file up to date if scope changes mid-build (e.g., an owner decision on an out-of-scope page flips it to in-scope) — these docs are the source of truth for what "done" means.
- **MUST** get explicit owner confirmation before deleting any currently-live page, asset, or data file (`Certificates.json`, `Contact.json`, duplicate project pages) even if it looks unused — "orphaned in the audit" is a flag to ask about, not permission to delete unilaterally.
- **MUST NOT** change the deployed domain/CNAME or hosting provider without the owner's explicit request.
- Every migrated page **MUST** be checked side-by-side against the corresponding live page before being marked complete (content-parity guardrail, per `plan.md` §11 QA phase).
