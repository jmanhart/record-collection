import { useState, useEffect } from "react";
import { MoonIcon } from "../Header/icons/MoonIcon";
import { SunIcon } from "../Header/icons/SunIcon";
import styles from "./ThemeToggle.module.css";

export function ThemeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Initialize theme from localStorage or default to dark
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const isDark = savedTheme === null ? true : savedTheme === "dark";
    setIsDarkMode(isDark);
    
    if (isDark) {
      document.body.classList.add("dark-theme");
      if (savedTheme === null) {
        localStorage.setItem("theme", "dark");
      }
    } else {
      document.body.classList.remove("dark-theme");
    }
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.body.classList.add("dark-theme");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark-theme");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <button
      id="theme-toggle"
      aria-label="Toggle theme"
      className={styles.themeToggle}
      onClick={toggleTheme}
    >
      <MoonIcon width="20" height="20" color="currentColor" />
      <SunIcon width="20" height="20" color="currentColor" />
    </button>
  );
}

