/* ═══════════════════════════════════════════════════════════════
   Velora — Theme Toggle Component (client)
   Handles dark/light mode persistence via localStorage.
   ═══════════════════════════════════════════════════════════════ */

'use client';

import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean>(false);

  // Initialise theme from localStorage (runs only in the browser)
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const dark = saved === 'dark';
    setIsDark(dark);
    document.documentElement.classList.toggle('dark', dark);
  }, []);

  const toggle = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    document.documentElement.classList.toggle('dark', newDark);
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
  };

  return (
    <button
      className="btn btn-ghost btn-sm"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={toggle}
    >
      {isDark ? '🌞' : '🌙'}
    </button>
  );
}
