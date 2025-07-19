"use client";

import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/context/AuthContext';

export function Providers({ children }: { children: React.ReactNode }) {
  // الترتيب هنا صحيح: AuthProvider داخل ThemeProvider
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}