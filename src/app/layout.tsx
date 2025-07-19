// src/app/layout.tsx
import type { Metadata } from "next";
import { Providers } from "./providers"; // استيراد
import Navbar from "./components/Navbar";
import "./globals.css";



export const metadata: Metadata = {
  title: "Task Manager",
  description: "Manage your tasks efficiently",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 👇 الخاصية suppressHydrationWarning مهمة جدًا لعمل next-themes
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <Navbar />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}