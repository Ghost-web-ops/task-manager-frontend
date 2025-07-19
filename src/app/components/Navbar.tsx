"use client"; // سنجعله مكون عميل ليسهل الوصول للـ context

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import LogoutButton from "./LogoutButton";
import { ThemeToggle } from './ThemeToggle';

export default function Navbar() {
  const { user } = useAuth(); // الحصول على بيانات المستخدم من الـ context

 
  return (
     <header className="navbar-debug bg-white shadow-md dark:bg-gray-900 dark:border-b dark:border-gray-700">
      <nav className="container flex items-center justify-between p-4 mx-auto">
        <Link href="/" className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
          TaskManager
        </Link>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          {user ? (
            <>
              <span>Welcome, {user.username}!</span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400">
                Login
              </Link>
              <Link href="/register" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}