"use client";

import { useState } from "react";

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  if (typeof document === "undefined") return "light";
  const attr = document.documentElement.getAttribute("data-theme");
  return attr === "dark" ? "dark" : "light";
}

/**
 * Toggles the `data-theme` attribute UX4G's dark-theme CSS relies on
 * (spec.md §3). No `useEffect` here — this is a direct response to a user
 * action (plan.md §3.3), not a synchronization with an external system.
 */
export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  function toggleTheme() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // localStorage unavailable (private browsing etc.) — theme still
      // applies for this session via the DOM attribute above.
    }
    setTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="ux4g-icon-btn ux4g-icon-btn-outline-primary ux4g-icon-btn-md"
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
    >
      <i className="ux4g-icon-outlined" aria-hidden="true">
        {theme === "dark" ? "light_mode" : "dark_mode"}
      </i>
    </button>
  );
}
