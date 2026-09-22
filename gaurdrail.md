# Guardrails
## Mohaneesh Sharma Portfolio — Dynamic Rebuild

Version: 3.0
Companion to: `intent.md`, `brd.md`, `spec.md`, `plan.md`

**What's new in v3.0**: adds a React Code Quality section (§3) distilling the project's "Impeccable React" contract — component contract, state-placement rules, effect discipline, React 19 idioms, TypeScript strictness, and a pre-delivery review gate — into hard MUST/MUST NOT rules, since `plan.md` v2.0 adopted it as the Build-stage standard.

These are the rules the implementation must follow. Anything marked **MUST** blocks a phase from being considered done; anything marked **MUST NOT** is a hard stop that needs the owner's explicit sign-off to override.

---

## 1. Content & Scope Guardrails

- **MUST NOT** silently drop any in-scope page, project case study, blog post, or certificate from `brd.md` §6.1 without the owner's explicit sign-off.
- **MUST NOT** migrate `figma.html` or `index2.html` until the owner has answered the open questions in `brd.md` §6.2 — build them out of the default route list until then. (`graphic.html` is now in scope, per `intent.md` v3.0 — it becomes real `video_editing`/`graphic_design` category content, not a page port.)
- **MUST NOT** migrate both `smartcity`/`smartcityproto` and both `S-touch`/`stouchproto` as separate live entries — confirm the canonical version with the owner first; the other is reference-only.
- **MUST NOT** touch or migrate `nyaysetu/` as part of this work — it is a separate sub-project (out of scope).
- **MUST** preserve the resume PDF and all certificate PDFs exactly as real assets (uploaded into the CMS, not deleted).
- **MUST** point the live domain at `www.mohaneesh.com` (per `intent.md` v3.0 §4), not the old `www.foxwise.in` — update `CNAME`/DNS as part of deployment, and confirm with the owner whether the old domain redirects or is retired.
- **MUST** preserve all existing static-page content as CMS seed data (`spec.md` §4) — no content invented from scratch during migration.
- **MUST** reconcile the About page's professional history against `Mohaneesh_UX_Designer.pdf` (`spec.md` §5) — the CV is the source of truth for roles/dates/skills; any mismatch between the current `About.html` copy and the CV **MUST** be flagged to the owner, not silently resolved either way.

## 2. Architecture & Code Quality Guardrails

- **MUST** use a single shared `<Header>`/`<Nav>`/`<Footer>` component set — **MUST NOT** reintroduce copy-pasted nav markup per page.
- **MUST** keep components small and single-purpose (a `ProjectCard` renders a card; it does not also own routing or data-fetching logic) — no God components.
- **MUST NOT** add abstractions, config options, or "just in case" flexibility beyond what the site actually needs.
- **MUST** type the data layer (`projects`, `blogs`, `certificates`, `leads`) — no untyped `any`-shaped JSON consumed ad hoc in components.

## 3. React Code Quality Guardrails (NEW — "Impeccable React" contract, per `plan.md` §3)

- **MUST** satisfy all five component-contract rules for every component: one reason to exist, props are the full API (no `any`, no reaching into globals), renders are pure, every state (loading/empty/error/partial) is deliberately rendered, and it's fully keyboard-operable.
- **MUST NOT** use `useEffect` + `useState` to derive a value from props/state, mirror server data, or reset state on a prop change — derive inline, fetch via Server Components/route handlers, or use a `key` respectively. This is the single most common defect class the skill flags, and it maps directly onto real risk spots in this codebase: CMS data fetching, the Tiptap editor's content state, and the Work page's category filter.
- **MUST** put the Work page's category filter (`intent.md` §2.4) in the URL search params, not local component state — it must survive refresh and be shareable.
- **MUST NOT** use array-index keys on Project/Blog/Certificate lists — these lists reorder via `display_order` or filtering; keys **MUST** be the record's real `id`.
- **MUST NOT** use `dangerouslySetInnerHTML` on Tiptap blog output without server-side sanitization first (ties directly into §6's security guardrail — this is the same rule stated twice on purpose, once as a security rule and once as a React anti-pattern, because it's the highest-risk spot in this codebase).
- **MUST NOT** build CMS admin forms as one `useState` per field — use `useActionState`/a reducer, per React 19 idioms in `plan.md` §3.4.
- **MUST** type every content type as a proper discriminated union / literal union where states are mutually exclusive (e.g. `Project.category`, loading/error/ready states) — **MUST NOT** use `any` or a silencing `as` anywhere in the codebase.
- **MUST** run the pre-delivery review gate (`plan.md` §3.7) before any component work is considered done — no stray `console.log`/TODO/commented-out code, no `setState` after unmount, all async work cancellable, list keys stable, StrictMode-safe.
- **MUST** actually build/typecheck/render any change touching more than ~3 files before calling it done — not just assert it's correct.

## 4. Design System Guardrails (UX4G, glassmorphism, theming)

Per `spec.md` §1–3, these are hard requirements, not style preferences:

- **MUST** build all UI from **UX4G Design System** components (`ux4g-web-components` npm package) — use documented components, classes, variants, sizes, and semantic tokens wherever an equivalent exists.
- **MUST NOT** recreate a UX4G component with custom markup. Custom CSS is allowed only where UX4G genuinely provides no equivalent (e.g. the bento-grid layout, blob animation, glassmorphism surface treatment) — and **MUST** be kept minimal and documented inline with the reason.
- **MUST NOT** mix `ux4g-web-components` (npm) with UX4G's CDN assets in the same app.
- **MUST** override brand colors as root-level UX4G *tokens* (Royal Blue `#2563eb` primary, Purple `#9333ea` secondary, `#0f172a` dark base, per `spec.md` §1.1) — **MUST NOT** override individual components or hard-code these colors ad hoc elsewhere in the codebase.
- **MUST NOT** invent UX4G component or token names — confirm exact names against the real installed `ux4g-web-components` package/docs before use (per the project's UX4G skill contract).
- **MUST** apply glassmorphism only as a decorative surface-level treatment (nav, hero/bento cards, stat badges, modals) — **MUST NOT** let it degrade text/interactive-element contrast below WCAG AA (4.5:1 body text, 3:1 large text/UI). Contrast **MUST** be verified against the *effective* rendered backdrop, separately in light and dark theme, not assumed from the panel's nominal color.
- **MUST** ship both light and dark themes fully working — a page or component that only looks right in one theme is not done. Every new UI addition **MUST** be checked in both themes before merge (per `spec.md` §3).

## 5. SEO Guardrails (non-negotiable given this is a portfolio site)

- **MUST** ensure every page ships with a real, crawlable `<title>` and meta description **in the actual rendered/server output** (verified via "view source", not devtools-rendered DOM).
- **MUST** include canonical, Open Graph, and Twitter Card tags on every page, targeting `www.mohaneesh.com`.
- **MUST** generate `sitemap.xml` and `robots.txt` from the real, live route list at build/deploy time — **MUST NOT** hand-maintain a sitemap that can drift out of sync with actual routes.
- **MUST** add `Person`/`CreativeWork`/`BlogPosting` JSON-LD per `plan.md`'s SEO section.
- **MUST** set `rel=canonical` correctly on any blog post republished from Medium/LinkedIn (per `brd.md` v2.0 §9.1) to avoid duplicate-content penalties, and **MUST** include the visible source attribution link required by `brd.md` FR13.
- Target Lighthouse SEO score ≥ 95 as an acceptance gate.

## 6. Security Guardrails

- **MUST** sanitize any rich-text/HTML content rendered from the CMS (blog post bodies, including Tiptap output) server-side before storage or render — **MUST NOT** trust client-side escaping alone, and **MUST NOT** reintroduce the old raw-`innerHTML` pattern (see also §3's React-level statement of this same rule).
- **MUST NOT** ship an admin/CMS/CRM surface without real authentication — the old `admin.html` pattern (no auth, no real persistence) **MUST NOT** carry forward in any form.
- **MUST** enforce auth checks server-side on every write endpoint (create/update/delete for projects, blogs, certificates, leads) — a hidden route is not access control.
- **MUST NOT** commit API keys, tokens, or credentials to the repo.
- **MUST** review any new npm dependency before adding it (maintenance status, bundle size, no unnecessary transitive bloat).

## 7. Required Libraries (locked-in choices, per `spec.md` §6)

- **MUST** use **pdf.js** (`pdfjs-dist`) for all in-app PDF rendering (certificate PDFs, resume) — **MUST NOT** fall back to a native `<embed>`/`<iframe>` browser PDF plugin or a different PDF library; the viewer must render inside a themed UX4G Modal/glass surface, which a native plugin cannot do.
- **MUST** use **Tiptap** for the CMS's blog rich-text editor — **MUST NOT** hand-roll a `contentEditable` editor or substitute a different rich-text library without owner sign-off.

## 8. Performance Guardrails

- **MUST NOT** regress load performance versus a modern baseline — target Lighthouse Performance ≥ 90 (mobile) on Home, Work, and a sample case study.
- **MUST** lazy-load below-the-fold images and compress/convert oversized assets (the `mentora` screenshot set flagged in the audit).
- **MUST NOT** introduce heavy, unnecessary libraries where a lighter option covers the need.
- **MUST NOT** let glassmorphism's `backdrop-filter`/blur usage tank scroll/animation performance — profile on a mid-range mobile device before shipping any glass-heavy view.
- **MUST NOT** hand-apply `memo`/`useMemo`/`useCallback` "for performance" without a measured cost — this hides real bottlenecks and adds noise (per `plan.md` §3.4).

## 9. Accessibility Guardrails

- **MUST** meet WCAG 2.1 AA basics: semantic HTML landmarks (a `<div onClick>` is a bug — use `<button>`), alt text on every image, sufficient color contrast (including through glass surfaces — see §4), full keyboard operability of nav/mobile-menu/PDF modal/Tiptap editor.
- **MUST** give every interactive element an accessible name (visible label, `aria-label`, or `aria-labelledby`) — icon-only buttons always carry an `aria-label`.
- **MUST** associate every form input with a `<label>` (`htmlFor`/`id`), keep focus visible (never `outline: none` without a replacement ring), and ensure the PDF viewer and mobile-menu modals trap focus, close on `Escape`, and restore focus to their trigger on close.
- **MUST NOT** rely on color alone to convey state (e.g., active nav link) — pair with an additional visual/semantic cue.
- Interactive targets **MUST** be ≥ 44×44 CSS px.

## 10. Process Guardrails

- **MUST** keep `intent.md` / `brd.md` / `spec.md` / `plan.md` / this file up to date if scope or design decisions change mid-build — these docs are the source of truth for what "done" means, per the project's AI-native SDLC flow (each stage's artifact is read by the next).
- **MUST** get explicit owner confirmation before deleting any currently-live page, asset, or data file, even if it looks unused.
- **MUST NOT** change the deployed domain or hosting provider beyond what's already confirmed (`www.mohaneesh.com`, per `intent.md` v3.0) without further owner sign-off.
- Every migrated page **MUST** be checked side-by-side against the corresponding live page for content parity, against `spec.md` §1–3 for design-system/theme/glassmorphism compliance, and against §3's React Impeccable pre-delivery gate, before being marked complete.
