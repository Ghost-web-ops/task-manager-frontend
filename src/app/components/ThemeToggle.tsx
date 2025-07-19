"use client";

import { useState, useEffect } from 'react'; // <-- استيراد Hooks جديدة
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false); // <-- حالة جديدة
  const { theme, setTheme } = useTheme();

  // useEffect runs only on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // <-- لا تعرض أي شيء حتى يتم التحميل في المتصفح
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
    >
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}