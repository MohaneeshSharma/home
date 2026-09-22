# Intent Document (v3.0)
## Confirmed Direction: Dynamic Multi-Discipline Portfolio + CMS + CRM on a New Domain

Version: 3.0 — resolves v2.0 open question §8 Q1 and adds two new confirmed requirements: domain change, multi-discipline work sections
Date: 2026-09-22
Context: v2.0 locked in a real dynamic backend (DB + API) and proposed a unified CMS+CRM admin panel, leaving several questions open. The owner has now answered and added scope: **both CMS and CRM are wanted**, the site is moving to a **new domain (`www.mohaneesh.com`)**, and — because the owner works both a job and freelance, across **UI/UX design, graphic design, and video editing** — the Work section must support **multiple creative disciplines**, not just UI/UX case studies.

---

## 1. Decisions Confirmed in This Update

| v2.0 open question | Answer |
|---|---|
| §8 Q1 — Leads/CRM scope | **Confirmed: both CMS (content) and CRM (leads) are required.** The Contact page needs a real form feeding the Leads module — link-only contact CTAs are no longer sufficient on their own. |
| Domain | **Changing from `www.foxwise.in` to `www.mohaneesh.com`.** `CNAME` and DNS must be updated as part of deployment (see §5). |
| Work/Projects scope | **Expanding beyond UI/UX.** The owner does paid work in UI/UX design, graphic design, and video editing (job + freelance) — the portfolio must represent all three, not just the current UI/UX case studies. This also resolves `brd.md`'s open question about `graphic.html` ("Visuals & Content"): it is **now in scope**, and becomes a real, dynamic content type rather than an orphan static page. |

## 2. New Requirement: Multi-Discipline Work Section

### 2.1 Business context (why this matters)

The current site (per the original audit in `brd.md`) only really represents UI/UX work: `Projects.html`/`Project.json` are UI/UX case studies, and `graphic.html` ("Visuals & Content" — branding/social/video work) exists but is disconnected from the main site (no nav link, not in the sitemap, inconsistent styling). Since the owner earns from **three distinct disciplines** and pursues **both salaried job opportunities and freelance clients**, the portfolio's job is now to let each type of visitor (a hiring manager vs. a freelance client looking for a video editor, say) quickly find the relevant work — a single undifferentiated project grid no longer serves that.

### 2.2 Data model implication

`Project` (the existing content type) needs a **discipline/category** field so the same underlying CMS module serves all three kinds of work instead of building three separate systems:

- `category`: `ui_ux` | `graphic_design` | `video_editing` (extensible — owner may add more later, e.g. "branding" as its own category if it grows large enough to deserve one).
- **Media shape differs by category** and the admin form/schema should account for it:
  - `ui_ux`: long-form case study (problem/process/outcome), image gallery, external prototype link (existing pattern, unchanged).
  - `graphic_design`: primarily an **image gallery** (branding assets, social posts, posters) — shorter description, less long-form writing.
  - `video_editing`: primarily **video embeds** (see §2.3 on hosting) plus a cover thumbnail, with a short description/credits (client, role, tools used).
- All three still share the common fields from v2.0 §5 (`status`, `slug`, `seo_title`, `seo_description`, `tags`, `created_at`/`updated_at`), so they remain one unified `projects` table/CMS module with a `category`-driven form, not three unrelated systems.

### 2.3 Video hosting recommendation (researched)

Self-hosting raw video files in Supabase Storage (or any object storage tied to the app's own budget) gets expensive fast on bandwidth and isn't necessary for a portfolio use case. **Recommendation**: video work is uploaded to **YouTube (unlisted) or Vimeo**, and the CMS stores only the **embed URL** + a cover thumbnail — the admin panel just needs a "paste video link" field, not a heavy video-upload pipeline. This keeps hosting cost near-zero and playback performance/CDN handled by a purpose-built video platform, while the CMS still fully owns the metadata (title, client, category, description, thumbnail).

### 2.4 Information architecture recommendation

Default recommendation (confirm with owner, this is a design decision not fully locked): keep **one "Work" page** with **category filter tabs** (e.g., "UI/UX" / "Graphic Design" / "Video Editing" / "All") rather than three separate top-level nav items — keeps the nav simple (still Home/Work/Certifications/About/Insights/Contact) while letting each visitor self-filter to what they came for. The Home page's "Selected Work" section can pull a small mixed or curated set across categories. `graphic.html`'s existing content becomes the seed data for the `graphic_design`/`video_editing` categories rather than a separate orphan page.

## 3. Leads/CRM Refinement (job vs. freelance)

Since the owner is evaluated differently by recruiters (job leads) vs. freelance/creative clients (project leads), the Leads module from v2.0 §3.1 gains one more field:

- `inquiry_type`: `job_opportunity` | `freelance_project` | `general` — lets the owner triage the CRM's Leads list by what kind of opportunity it is, which is genuinely useful given the dual job+freelance context. Simple dropdown on the contact form, stored with the lead.

## 4. Domain Change — Implementation Notes

- `CNAME` file (currently `www.foxwise.in`) must be updated to `www.mohaneesh.com` once the new domain is registered/ready and pointed at the new host (Vercel, per v2.0 §4).
- All canonical URLs, Open Graph URLs, sitemap entries, and JSON-LD `url` fields (planned in `plan.md`'s SEO section) must use `www.mohaneesh.com` from the start — no point building SEO infrastructure against a domain that's being retired.
- If `www.foxwise.in` has any existing inbound links/search-engine indexing (recruiters may have it bookmarked, it may be indexed), a **redirect from the old domain to the new one** is worth setting up post-migration to preserve any existing SEO equity — flagged as a recommended step, not yet confirmed as required (owner to confirm if `foxwise.in` should be kept alive as a redirect or simply dropped).
- This is a real infrastructure change, not just a docs update — it should happen as part of the deployment phase once the domain is actually registered/DNS-ready, not before.

## 5. Updated Content/Data Model Summary

Building on v2.0 §5:

```
projects
  id, title, slug, category (ui_ux | graphic_design | video_editing),
  description, long_description (nullable, mainly for ui_ux),
  cover_image_url, gallery_image_urls[], video_embed_url (nullable),
  tags[], external_link (nullable), status (draft|published),
  seo_title, seo_description, display_order, created_at, updated_at

blogs
  (unchanged from v2.0 §5)

certificates
  (unchanged from v2.0 §5)

leads
  id, name, contact_method, message, inquiry_type (job_opportunity | freelance_project | general),
  status (new|contacted|closed), notes, created_at
```

## 6. Feature Parity (updated)

| Content | Old way | New way |
|---|---|---|
| UI/UX Projects | Hand-edit `Project.json` | CMS, `category = ui_ux` |
| Graphic Design work | Static, disconnected `graphic.html` | CMS, `category = graphic_design`, image-gallery-first form |
| Video Editing work | Didn't exist as structured content | CMS, `category = video_editing`, embed-link-first form (YouTube/Vimeo) |
| Blogs, Certificates | (unchanged from v2.0) | (unchanged from v2.0) |
| Leads | None | CRM, now with job-vs-freelance triage |

## 7. Non-Goals (unchanged)

- Visual redesign is still not the point of this migration — new categories get their own sensible layout/templates, but the overall brand/look stays consistent with the existing design direction.
- `nyaysetu/` remains out of scope.
- No self-hosted video file storage (per §2.3 — deliberately out of scope in favor of YouTube/Vimeo embeds).

## 8. Open Questions (updated)

1. **Domain readiness** — is `mohaneesh.com` already registered and ready to point DNS at the new host, or does that need to happen first before deployment can go live?
2. **Old domain handling** — keep `www.foxwise.in` alive as a redirect to preserve any existing SEO/links, or fully retire it (§4)?
3. **Category taxonomy** — is `ui_ux` / `graphic_design` / `video_editing` the right split, or does the owner want finer categories (e.g., branding split out from graphic design, motion graphics split from video editing)?
4. **Video platform preference** — YouTube (unlisted) vs. Vimeo for embeds (§2.3) — any existing channel/account to reuse?
5. Still open from v2.0 §8: real blog view-count tracking, Settings module scope (editing resume/social links via CMS vs. code-level), notification-on-new-lead preference, and the still-unresolved fate of `figma.html`/`index2.html` and the duplicate project pages (`smartcity`/`smartcityproto`, `S-touch`/`stouchproto`) from `brd.md`.

## 9. Relationship to Other Documents

- `brd.md` — its open question on `graphic.html`'s fate is now resolved (in scope, becomes real content); scope section should eventually be updated to reflect the three-discipline Work section.
- `plan.md` — still needs the Next.js + Supabase revision from v2.0 §9, and now additionally needs: the `category`-aware Projects schema/admin form (§2.2), the video-embed-only media strategy (§2.3), and all SEO/canonical/sitemap work built against `www.mohaneesh.com` instead of `www.foxwise.in` (§4).
- `gaurdrail.md` — no new guardrails required yet, but a future addition worth considering: **"MUST NOT store raw video files in the project's own storage — video content MUST be embedded via YouTube/Vimeo"** should be added as a guardrail once §8 Q4 is answered, to stop anyone in the future re-introducing an expensive self-hosted video pipeline.

**Next step**: once §8's remaining questions are answered (domain readiness is the most time-sensitive one, since it gates deployment), revise `plan.md` into a concrete implementation plan covering the Next.js + Supabase architecture, the multi-category Projects schema, and the domain-aware SEO setup.
