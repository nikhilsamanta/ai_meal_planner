export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white py-12 dark:border-zinc-800 dark:bg-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <a href="#" className="flex items-center gap-2 text-lg font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              <span>MealPlanner AI</span>
            </a>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
            <a href="#" className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors">
              Home
            </a>
            <a href="#features" className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors">
              How It Works
            </a>
          </div>

          {/* Copyright */}
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            &copy; {new Date().getFullYear()} MealPlanner AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
