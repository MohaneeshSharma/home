import type { Metadata } from "next";
import "ux4g-web-components/styles.css";
import "ux4g-web-components/design-system";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mohaneesh Sharma | Product Designer",
  description:
    "UI/UX and graphic designer portfolio — case studies, blogs, and certifications.",
};

// Inline, pre-hydration theme script (not a React effect — this must run
// before paint to avoid a flash of the wrong theme, which useEffect cannot
// do). Reads a saved preference, falls back to the OS setting. Static
// string, no user input — safe to inline.
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem('theme');
    var theme = stored === 'light' || stored === 'dark'
      ? stored
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
