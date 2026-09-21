# Implementation Plan
## React Migration — Mohaneesh Sharma Portfolio

Version: 1.0
Companion to: `brd.md`, `gaurdrail.md`

---

## 1. Tech Stack Decision

| Layer | Choice | Why |
|---|---|---|
| Framework | **React 18** | Requested explicitly — component-based, well-optimized rewrite. |
| Build tool | **Vite** | Fast dev server, first-class React support, easy static build output, easy to layer SSG on top of. |
| Routing | **react-router-dom v6/v7** | Standard, works with the SSG plugin below. |
| Styling | **Tailwind CSS v4** with a real build (PostCSS/CLI) — replacing the 478KB Play CDN script | Already a dependency in `package.json`; just needs to actually be wired into a build instead of shipped unused. One central `tailwind.config`/theme instead of per-page duplication. |
| **SEO — pre-rendering** | **`vite-react-ssg`** | This is the key SEO decision. A plain Vite+React SPA is client-side-rendered only — crawlers/link-preview bots that don't execute JS (many social previews, some crawlers) see an empty shell. `vite-react-ssg` builds each route to **real static HTML at build time** (like Next.js's static export, but for a plain Vite+React app — no need to adopt a whole framework), while the app still hydrates into a normal interactive React SPA in the browser. This directly satisfies "React + SEO-friendly" without switching to Next.js. |
| **SEO — per-page `<head>` tags** | **`react-helmet-async`** (or the head API built into `vite-react-ssg`, which is compatible with it) | Lets every page component declare its own `<title>`, meta description, canonical, Open Graph, Twitter Card tags — and because SSG renders at build time, these tags are present in the actual static HTML, not just injected client-side. |
| Sitemap/robots | **`vite-plugin-sitemap`** (or a small custom Vite plugin) | Auto-generates `sitemap.xml` and `robots.txt` from the real route list at build time — fixes the current stale/mis-cased sitemap. |
| Structured data | Plain JSON-LD `<script type="application/ld+json">` injected per page via the same head-management approach (no extra library needed) | `Person` schema on Home/About, `CreativeWork`/`Article` schema on case studies and blog posts. |
| Images | Native `loading="lazy"`, `<picture>`/WebP, optionally `vite-imagetools` for build-time resizing/compression | Fixes the currently large, unoptimized screenshots (mentora folder). |
| Content sanitization | **`dompurify`** (only if raw HTML from `Blogs.json` `content` field is kept) | Prevents the current `innerHTML` XSS pattern from carrying over. |
| Icons | Keep **Font Awesome** or swap to `lucide-react` / `react-icons` (lighter, tree-shakeable) | Optional optimization; confirm with owner if visual parity matters more than bundle size. |
| Package manager | npm (matches existing `package-lock.json`) | No reason to switch. |

> Note on Next.js: Next.js would also solve SEO (SSR/SSG built-in) and is itself a React framework, but the user specifically asked for "react" + "add an SEO-friendly library" — so the plan above (Vite + `vite-react-ssg`) delivers real static-HTML SEO while staying a plain React app with an added library, per the request. If full SSR (not just static generation), API routes, or ISR are ever needed, Next.js is the fallback recommendation — call this out to the owner as an option, not a default.

## 2. High-Level Folder Structure

```
/src
  /components        -> Header, Footer, Nav, MobileMenu, SEO (head component), Modal, PdfViewer, Carousel, ProjectCard, BlogCard, CertificateCard, Timeline, StatBadge, ExpertiseGrid, CTASection
  /pages              -> Home, About, Projects, ProjectDetail, Blogs, BlogDetail, Certificates, Contact, NotFound
  /data               -> projects.ts, blogs.ts, certificates.ts (typed wrappers around the JSON, or JSON imported directly with types)
  /assets             -> images (optimized), Certificates PDFs, resume PDF
  /hooks              -> useActiveRoute, useFetchJson (if data stays as fetched JSON) etc.
  /styles             -> tailwind.css (single entry), theme tokens
  /lib                -> seo constants (site name, base URL, default OG image), sanitize.ts
  main.tsx, App.tsx, routes.tsx
/public               -> robots.txt (or generated), favicon, static files that must keep their exact path (resume PDF, sitemap if not generated)
```

## 3. Component Inventory (derived from the audit)

| Component | Replaces | Notes |
|---|---|---|
| `<Header/>` + `<Nav/>` + `<MobileMenu/>` | Copy-pasted nav in every page + the currently-unused `components/header.html` | Single source of truth, active-link highlighting, one mobile-menu implementation. |
| `<Footer/>` | Repeated footer markup | Social links, CTA. |
| `<SEO/>` | (didn't exist before) | Wraps `react-helmet-async`; takes `title`, `description`, `canonical`, `image`, `type`, optional JSON-LD; used at the top of every page component. |
| `<ProjectCard/>` | Hardcoded cards on Home + Projects.html | Props from `projects.ts`. |
| `<BlogCard/>` | Hardcoded cards on Home + Blogs.html | Props from `blogs.ts`; fixes the "Blogs.html doesn't read Blogs.json" bug. |
| `<CertificateCard/>` + `<PdfModal/>` | Hardcoded cert list + `openModal()` in certificate.html | Data-driven from `certificates.ts` (resolves the orphaned `Certificates.json` question). |
| `<Timeline/>` | About.html's animated timeline | Data-driven from a small `experience.ts`. |
| `<HeroBento/>` / `<ExpertiseGrid/>` | Home's bento grid | Kept largely as visual/markup, componentized. |
| `<ContactCTA/>` | contact.html's 4 buttons | Simple props-driven list of channel + href + icon. |

## 4. Page-by-Page Migration Mapping

| Current file | New route | Notes |
|---|---|---|
| `index.html` | `/` (Home) | Rebuild bento grid, stats, selected work (from `projects.ts`), blog carousel (from `blogs.ts`, top N by date). |
| `About.html` | `/about` | Fix the broken `inter.css` path issue by using a proper font pipeline (self-hosted font files or `@fontsource`, loaded once via Tailwind/Vite, not a fragile relative `<link>`). |
| `Projects.html` | `/projects` | Data-driven from `projects.ts`; drop the leftover browser-export artifacts found in the current file (treat current DOM as reference only). |
| `projects/*.html` (121vibes, S-touch, mentora, subhartian) | `/projects/:slug` | One `ProjectDetail` page template rendering per-project long-form content; confirm canonical version for `smartcity` vs `smartcityproto` and `S-touch` vs `stouchproto` with the owner before migrating (do not migrate duplicates as separate routes). |
| `Blogs.html` | `/blogs` | Must actually render all of `blogs.ts` (fixes current 3-hardcoded-posts bug); re-implement the search bar for real or remove it. |
| `Detailed_blog.html` + `blogs/Detailed_blog.html` (duplicate) | `/blogs/:id` | Single dynamic route replaces both duplicate files; sanitize any HTML `content` field with `dompurify` before rendering. |
| `certificate.html` | `/certificates` | Data-driven from `certificates.ts`; reuse `<PdfModal/>` for viewing. |
| `contact.html` | `/contact` | Same CTA links (WhatsApp/tel/mailto/LinkedIn); real form left as a documented future option. |
| `Mohaneesh_UX_Designer.pdf` | `/public/resume.pdf` (or similar) | Linked from Home hero (and About/Contact per BRD FR9). |
| `graphic.html`, `figma.html`, `index2.html`, `admin.html` | **Pending owner decision** (BRD §5.2) | Do not migrate until scope is confirmed; keep out of the route list / sitemap by default. |
| `nyaysetu/` | **Out of scope** | Not touched by this migration. |

## 5. Data Layer Plan

- Keep `Project.json` / `Blogs.json` as the underlying data, but import them as typed modules (`import projects from './data/projects.json'` with a TypeScript interface) rather than `fetch()`-ing at runtime — this lets the SSG step bake the data into the static HTML at build time (better SEO/perf than a client-side fetch-then-render waterfall).
- `Certificates.json`/`Contact.json`: per BRD, either populate and wire into `certificate.html`'s real data, or delete — do not carry forward silently unused files.
- `admin.html`'s pattern (in-memory edit + console.log) is not carried forward. If content editing is still wanted post-migration, that's a separate, explicitly-scoped follow-up (e.g., editing the JSON/TS data files directly via PR, or a real headless CMS) — not part of this plan.

## 6. SEO Implementation Plan

1. Add `react-helmet-async` (or `vite-react-ssg`'s built-in head handling) + a shared `<SEO/>` component; every page sets a **unique** title + meta description (fixing the current missing-description bug on Home/About/Projects/graphic).
2. Add canonical URLs (`https://www.foxwise.in/...`) per page.
3. Add Open Graph + Twitter Card tags (title, description, image, url, type) — needed for good LinkedIn/WhatsApp share previews, which the current site has zero of.
4. Add JSON-LD: `Person` schema on Home/About (name, jobTitle, sameAs: LinkedIn etc.), `CreativeWork` on project case studies, `BlogPosting` on blog detail pages.
5. Generate `sitemap.xml` and `robots.txt` at build time from the actual route list (fixes stale/mis-cased entries found in the audit).
6. Run `vite-react-ssg build` so every route ships as real static HTML (not just an SPA shell) — this is the single biggest SEO lever for this site.
7. Verify with Lighthouse + a "view page source" check (not devtools-rendered DOM) that title/description/OG/JSON-LD are present in the raw HTML response for at least Home, Projects, and one case study.

## 7. Styling Plan

- One `tailwind.config` (or Tailwind v4 CSS-based `@theme` config) holding the current custom `brand` color scale, fonts, and `blob`/`fadeInUp` keyframes — currently duplicated per page.
- Replace the two inconsistent Tailwind CDN deliveries with the real compiled build already half-set-up in `package.json` (`tailwindcss`, `postcss`, `autoprefixer` are installed but unused today).
- Consolidate fonts: pick one strategy (self-hosted `@fontsource` packages or a single Google Fonts `<link>` in `index.html`) instead of the current mixed Inter/Plus Jakarta Sans + broken `inter.css` path situation.

## 8. Assets Pipeline

- Move/optimize images to WebP (already partly WebP), compress the unoptimized `mentora` screenshots.
- Lazy-load below-the-fold images (`loading="lazy"`).
- Keep certificate PDFs and resume PDF as static public assets, unchanged paths where possible for continuity with any existing external links.

## 9. Migration Phases

1. **Phase 0 — Setup**: Scaffold Vite + React + TS, install Tailwind v4 build, react-router, `vite-react-ssg`, `react-helmet-async`, `dompurify`; set up folder structure and the shared Tailwind theme.
2. **Phase 1 — Shared shell**: Build `<Header>`, `<Nav>`, `<MobileMenu>`, `<Footer>`, `<SEO>` components and base layout/routing; get a bare Home + About route rendering and hydrating correctly with SSG.
3. **Phase 2 — Content-driven pages**: Migrate `projects.ts`/`blogs.ts` data, build `Projects`, `ProjectDetail`, `Blogs`, `BlogDetail`, `Certificates` pages against real data (resolving the Blogs.html/Certificates.json bugs from the audit).
4. **Phase 3 — Remaining pages + decisions**: Contact page; resolve owner decisions on `graphic.html`/`admin.html`/`figma.html`/`index2.html`/duplicate case studies, and migrate or drop accordingly.
5. **Phase 4 — SEO + performance pass**: Wire up meta/OG/JSON-LD on every page, sitemap/robots generation, image optimization, Lighthouse pass (target scores in BRD §9).
6. **Phase 5 — QA + content parity check**: Side-by-side comparison against the live site per the BRD's acceptance criteria; fix any regressions.
7. **Phase 6 — Deploy**: Build static output, deploy to the existing host (preserving `CNAME` → `www.foxwise.in`), verify DNS/GitHub Pages settings still work with the new static output structure.

## 10. Deployment Plan

- Keep the existing `CNAME` file (`www.foxwise.in`) in the deploy output.
- Build produces a fully static `dist/` (via `vite-react-ssg build`) deployable to GitHub Pages exactly like the current site, or any static host — no server required, preserving today's zero-backend hosting model.
- Confirm the GitHub Pages source branch/workflow after migration (this repo currently has no CI/workflow files found in the audit — a simple GitHub Actions build+deploy workflow should be added).

## 11. Testing Plan

- Manual cross-page content-parity pass against the live site (per page in the BRD scope).
- Lighthouse (mobile) on Home, Projects, one case study, one blog post — Performance/SEO/Accessibility/Best-Practices ≥ 90 target.
- "View source" check that SSG output contains real content + meta tags (not just a `<div id="root">` shell).
- Responsive check at common breakpoints (mobile/tablet/desktop).
- Broken-link check across the new route list + sitemap.

## 12. Timeline (rough, effort-based, not calendar-committed)

| Phase | Rough effort |
|---|---|
| 0 — Setup | 0.5–1 day |
| 1 — Shared shell | 1 day |
| 2 — Content-driven pages | 2–3 days |
| 3 — Remaining pages + decisions | 1–2 days (depends on owner answers) |
| 4 — SEO + performance | 1 day |
| 5 — QA | 0.5–1 day |
| 6 — Deploy | 0.5 day |

Total: roughly **1–1.5 focused weeks**, assuming scope decisions in BRD §5.2 are answered promptly.
