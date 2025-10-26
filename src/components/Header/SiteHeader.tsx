import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { HamburgerIcon } from "./icons/HamburgerIcon";
import { MoonIcon } from "./icons/MoonIcon";
import { SunIcon } from "./icons/SunIcon";
import { BackButton } from "./BackButton";
import { Breadcrumb } from "./Breadcrumb";
import styles from "./SiteHeader.module.css";

interface SiteHeaderProps {
  mainSiteUrl?: string;
}

export function SiteHeader({ mainSiteUrl = "/" }: SiteHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const isDark = savedTheme === "dark";
    setIsDarkMode(isDark);
    
    if (isDark) {
      document.body.classList.add("dark-theme");
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
      localStorage.removeItem("theme");
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        toggleRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !toggleRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isMenuOpen]);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        {/* Back Button and Breadcrumb - Always visible */}
        <BackButton mainSiteUrl={mainSiteUrl} />
        <Breadcrumb />

        <div className={styles.headerActions}>
          {/* Mobile menu toggle */}
          <button
            ref={toggleRef}
            id="menu-toggle"
            aria-label="Toggle menu"
            className={styles.overflowMenuToggle}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <HamburgerIcon width="32" height="32" />
          </button>

          {/* Navigation menu */}
          <div
            ref={menuRef}
            id="menu"
            className={`${styles.menu} ${isMenuOpen ? styles.open : ""}`}
          >
            {mainSiteUrl && (
              <>
                <a
                  href={`${mainSiteUrl}/projects`}
                  className={styles.menuLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Projects
                </a>
                <a
                  href={`${mainSiteUrl}/writing`}
                  className={styles.menuLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Writing
                </a>
                <a
                  href={`${mainSiteUrl}/social`}
                  className={styles.menuLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Links
                </a>
                <a
                  href={`${mainSiteUrl}/about`}
                  className={styles.menuLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  About
                </a>
              </>
            )}
          </div>

          {/* Theme toggle */}
          <button
            id="theme-toggle"
            aria-label="Toggle theme"
            className={styles.themeToggle}
            onClick={toggleTheme}
          >
            <MoonIcon
              width="20"
              height="20"
              color="currentColor"
            />
            <SunIcon
              width="20"
              height="20"
              color="currentColor"
            />
          </button>
        </div>
      </nav>
    </header>
  );
}

