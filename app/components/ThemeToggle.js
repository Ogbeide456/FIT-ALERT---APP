"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    let savedTheme = "dark";
    try {
      const storedTheme = window.localStorage.getItem("fitalert-theme");
      if (storedTheme === "light" || storedTheme === "dark") savedTheme = storedTheme;
    } catch (error) {
      console.warn("Fitalert could not read the saved theme preference:", error);
    }
    document.documentElement.dataset.theme = savedTheme;
    setTheme(savedTheme);
  }, []);

  function changeTheme(nextTheme) {
    document.documentElement.dataset.theme = nextTheme;
    setTheme(nextTheme);
    try {
      window.localStorage.setItem("fitalert-theme", nextTheme);
    } catch (error) {
      console.warn("Fitalert could not save the theme preference:", error);
    }
  }

  const nextTheme = theme === "dark" ? "light" : "dark";
  return (
    <button
      className="theme-toggle"
      type="button"
      aria-label={`Switch to ${nextTheme} mode`}
      title={`Switch to ${nextTheme} mode`}
      onClick={() => changeTheme(nextTheme)}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
        {theme === "dark" ? (
          <>
            <circle cx="12" cy="12" r="3.5" />
            <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
          </>
        ) : (
          <path d="M20.2 15.4A8.5 8.5 0 0 1 8.6 3.8 8.5 8.5 0 1 0 20.2 15.4Z" />
        )}
      </svg>
    </button>
  );
}
