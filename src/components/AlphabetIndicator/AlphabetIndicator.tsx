import { useState, useEffect, useRef } from "react";
import styles from "./AlphabetIndicator.module.css";

interface AlphabetIndicatorProps {
  records: Array<{ artist: string; [key: string]: any }>;
}

export function AlphabetIndicator({ records }: AlphabetIndicatorProps) {
  const [activeLetter, setActiveLetter] = useState<string>("A");
  const [hoveredLetter, setHoveredLetter] = useState<string>("");
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      // Get all record cards
      const cards = document.querySelectorAll('[data-artist-letter]');
      
      if (cards.length === 0) return;

      // Find which letter section is currently at the top of the viewport
      let currentLetter = "A"; // Default to A
      const scrollPosition = window.scrollY + 200; // Offset for header

      for (let i = 0; i < cards.length; i++) {
        const card = cards[i] as HTMLElement;
        const rect = card.getBoundingClientRect();
        const absoluteTop = rect.top + window.scrollY;

        if (absoluteTop <= scrollPosition) {
          const letter = card.getAttribute('data-artist-letter');
          if (letter) {
            currentLetter = letter.toUpperCase();
          }
        } else {
          break;
        }
      }

      setActiveLetter(currentLetter);
    };

    // Initial check
    handleScroll();

    // Add scroll listener with throttling for smoothness
    let ticking = false;
    const scrollListener = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", scrollListener, { passive: true });
    return () => window.removeEventListener("scroll", scrollListener);
  }, [records]);

  const scrollToLetter = (letter: string, smooth = true) => {
    const firstCard = document.querySelector(`[data-artist-letter="${letter}"]`);
    if (firstCard) {
      const rect = firstCard.getBoundingClientRect();
      const scrollTop = window.scrollY + rect.top - 200; // Offset for header
      window.scrollTo({ top: scrollTop, behavior: smooth ? 'smooth' : 'auto' });
    }
  };

  const getLetterFromMousePosition = (clientY: number): string | null => {
    if (!containerRef.current) return null;
    
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const relativeY = clientY - rect.top;
    const letterHeight = rect.height / alphabet.length;
    const index = Math.floor(relativeY / letterHeight);
    
    if (index >= 0 && index < alphabet.length) {
      return alphabet[index];
    }
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsScrubbing(true);
    const letter = getLetterFromMousePosition(e.clientY);
    if (letter) {
      setHoveredLetter(letter);
      scrollToLetter(letter, false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isScrubbing) {
      const letter = getLetterFromMousePosition(e.clientY);
      if (letter) {
        setHoveredLetter(letter);
        scrollToLetter(letter, false);
      }
    }
  };

  const handleMouseUp = () => {
    setIsScrubbing(false);
    setHoveredLetter("");
  };

  const handleMouseLeave = () => {
    if (isScrubbing) {
      setIsScrubbing(false);
    }
    setHoveredLetter("");
  };

  // Global mouse up listener for when mouse is released outside the component
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isScrubbing) {
        setIsScrubbing(false);
        setHoveredLetter("");
      }
    };

    if (isScrubbing) {
      window.addEventListener('mouseup', handleGlobalMouseUp);
      return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
    }
  }, [isScrubbing]);

  return (
    <div 
      className={styles.container}
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.letters}>
        {alphabet.map((letter) => {
          const isActive = letter === activeLetter;
          const isHovered = letter === hoveredLetter;
          const showLabel = isActive || isHovered;
          
          return (
            <div
              key={letter}
              className={`${styles.letterItem} ${isActive ? styles.active : ""} ${isScrubbing ? styles.scrubbing : ""}`}
              onMouseEnter={() => !isScrubbing && setHoveredLetter(letter)}
              onMouseLeave={() => !isScrubbing && setHoveredLetter("")}
              onClick={() => !isScrubbing && scrollToLetter(letter)}
            >
              <span className={styles.hash}>—</span>
              {showLabel && <span className={styles.letter}>{letter}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

