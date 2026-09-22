import ThemeToggle from "@/components/ThemeToggle";

/**
 * Phase 0 proof-of-concept (plan.md §9, Task 8): confirms Next.js + UX4G +
 * the brand theme tokens + glassmorphism + light/dark theming all work
 * together end to end. Not the real Home page — that's Phase 1 (plan.md §9),
 * built against real CMS data per brd.md FR2.
 */
export default function Home() {
  return (
    <>
      <nav className="ux4g-navbar">
        <div className="ux4g-navbar-wrap ux4g-d-flex ux4g-jc-between ux4g-ai-center">
          <span className="ux4g-heading-xl-strong ux4g-text-brand-primary-default">
            Mohaneesh.
          </span>
          <ThemeToggle />
        </div>
      </nav>

      <main className="ux4g-d-flex ux4g-flex-col ux4g-ai-center ux4g-p-l" style={{ gap: "var(--ux4g-gap-xl, 2rem)" }}>
        <section
          className="glass-surface ux4g-radius-l ux4g-p-xl"
          style={{ maxWidth: "40rem", textAlign: "center" }}
        >
          <h1 className="ux4g-display-l-default ux4g-text-neutral-primary">
            Phase 0 foundation is live.
          </h1>
          <p className="ux4g-body-m-default ux4g-text-neutral-secondary ux4g-mt-m">
            Next.js, UX4G Design System, the Royal Blue/Purple brand theme,
            glassmorphism surfaces, and light/dark theming are all wired up
            and rendering together.
          </p>
          <button type="button" className="ux4g-btn-primary ux4g-btn-lg ux4g-mt-l">
            This is a UX4G primary button
          </button>
        </section>

        <div className="ux4g-card ux4g-card-solid ux4g-card-vertical ux4g-p-l" style={{ maxWidth: "24rem" }}>
          <span className="ux4g-tag-tonal-neutral ux4g-tag-s">Design system</span>
          <h2 className="ux4g-heading-m-strong ux4g-mt-s">UX4G components</h2>
          <p className="ux4g-body-s-default ux4g-text-neutral-secondary">
            This card, the navbar, the button, and the tag above are all real
            UX4G component classes — no custom-built equivalents.
          </p>
        </div>
      </main>
    </>
  );
}
