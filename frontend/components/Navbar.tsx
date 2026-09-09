"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-black/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              <span>MealPlanner AI</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {!user ? (
              <>
                <a
                  href="#features"
                  className="text-sm font-medium text-zinc-600 hover:text-emerald-600 dark:text-zinc-300 dark:hover:text-emerald-400 transition-colors"
                >
                  Features
                </a>
                <a
                  href="#how-it-works"
                  className="text-sm font-medium text-zinc-600 hover:text-emerald-600 dark:text-zinc-300 dark:hover:text-emerald-400 transition-colors"
                >
                  How It Works
                </a>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-zinc-600 hover:text-emerald-600 dark:text-zinc-300 dark:hover:text-emerald-400 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/meal-plan"
                  className="text-sm font-medium text-zinc-600 hover:text-emerald-600 dark:text-zinc-300 dark:hover:text-emerald-400 transition-colors"
                >
                  Meal Plan
                </Link>
                <Link
                  href="/shopping-list"
                  className="text-sm font-medium text-zinc-600 hover:text-emerald-600 dark:text-zinc-300 dark:hover:text-emerald-400 transition-colors"
                >
                  Shopping List
                </Link>
                <Link
                  href="/profile"
                  className="text-sm font-medium text-zinc-600 hover:text-emerald-600 dark:text-zinc-300 dark:hover:text-emerald-400 transition-colors"
                >
                  Profile
                </Link>
              </>
            )}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {!user ? (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-zinc-600 hover:text-emerald-600 dark:text-zinc-300 dark:hover:text-emerald-400 transition-colors px-3 py-2 rounded-lg"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 dark:bg-emerald-500 dark:hover:bg-emerald-600 dark:active:bg-emerald-700 px-4 py-2 rounded-lg transition-colors shadow-sm shadow-emerald-600/10"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  Welcome, <strong className="font-semibold text-zinc-800 dark:text-zinc-200">{user.name}</strong>
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-zinc-600 hover:text-red-600 dark:text-zinc-300 dark:hover:text-red-400 transition-colors px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-red-200 dark:hover:border-red-900"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 focus:outline-none dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-300"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black" id="mobile-menu">
          <div className="space-y-1 px-4 py-3">
            {!user ? (
              <>
                <a
                  href="#features"
                  onClick={() => setIsOpen(false)}
                  className="block rounded-lg px-3 py-2 text-base font-medium text-zinc-600 hover:bg-zinc-50 hover:text-emerald-600 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-emerald-400"
                >
                  Features
                </a>
                <a
                  href="#how-it-works"
                  onClick={() => setIsOpen(false)}
                  className="block rounded-lg px-3 py-2 text-base font-medium text-zinc-600 hover:bg-zinc-50 hover:text-emerald-600 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-emerald-400"
                >
                  How It Works
                </a>
                <div className="border-t border-zinc-200 my-2 pt-2 dark:border-zinc-800" />
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="block rounded-lg px-3 py-2 text-base font-medium text-zinc-600 hover:bg-zinc-50 hover:text-emerald-600 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-emerald-400"
                >
                  Login
                </Link>
                <div className="px-3 pt-2">
                  <Link
                    href="/register"
                    onClick={() => setIsOpen(false)}
                    className="flex w-full items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-base font-medium text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                  >
                    Get Started
                  </Link>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="block rounded-lg px-3 py-2 text-base font-medium text-zinc-600 hover:bg-zinc-50 hover:text-emerald-600 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-emerald-400"
                >
                  Dashboard
                </Link>
                <Link
                  href="/meal-plan"
                  onClick={() => setIsOpen(false)}
                  className="block rounded-lg px-3 py-2 text-base font-medium text-zinc-600 hover:bg-zinc-50 hover:text-emerald-600 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-emerald-400"
                >
                  Meal Plan
                </Link>
                <Link
                  href="/shopping-list"
                  onClick={() => setIsOpen(false)}
                  className="block rounded-lg px-3 py-2 text-base font-medium text-zinc-600 hover:bg-zinc-50 hover:text-emerald-600 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-emerald-400"
                >
                  Shopping List
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="block rounded-lg px-3 py-2 text-base font-medium text-zinc-600 hover:bg-zinc-50 hover:text-emerald-600 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-emerald-400"
                >
                  Profile
                </Link>
                <div className="border-t border-zinc-200 my-2 pt-2 dark:border-zinc-800" />
                <div className="px-3 py-2 text-sm text-zinc-500 dark:text-zinc-400">
                  Logged in as <strong className="text-zinc-800 dark:text-zinc-200">{user.name}</strong>
                </div>
                <div className="px-3 pt-2">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
                    className="flex w-full items-center justify-center rounded-lg bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 px-4 py-2.5 text-base font-medium border border-red-200 dark:border-red-900 hover:bg-red-100"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

