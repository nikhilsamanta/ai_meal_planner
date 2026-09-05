export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-zinc-50 py-20 dark:bg-zinc-950 sm:py-32">
      {/* Decorative Background Glows */}
      <div className="absolute top-0 left-1/2 -z-10 h-[600px] w-[1000px] -translate-x-1/2 stroke-zinc-200 [mask-image:radial-gradient(600px_600px_at_top,white,transparent)] dark:stroke-zinc-800">
        <svg className="absolute inset-0 h-full w-full opacity-30 dark:opacity-20" aria-hidden="true">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse" x="50%">
              <path d="M.5 40V.5H40" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      <div className="absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-white shadow-xl shadow-emerald-500/10 ring-1 ring-zinc-50 dark:bg-zinc-900/40 dark:ring-zinc-800/10" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-600/20 dark:bg-emerald-950/30 dark:text-emerald-300 dark:ring-emerald-500/30 mb-8 animate-fade-in">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400"
            >
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Zm1-15a1 1 0 1 0-2 0v5a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V7Z" />
            </svg>
            Save hours of cooking prep every week
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-6xl lg:text-7xl">
            <span className="block">Plan smarter.</span>
            <span className="block bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-300">
              Eat better. Shop easier.
            </span>
          </h1>

          {/* Supporting Text */}
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-400 sm:text-xl">
            Create personalized weekly meal plans based on your family, food preferences, budget and nutrition goals.
          </p>

          {/* Action Buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="#meal-plan-preview"
              className="flex w-full items-center justify-center rounded-xl bg-emerald-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 active:bg-emerald-800 dark:bg-emerald-500 dark:hover:bg-emerald-600 dark:active:bg-emerald-700 dark:shadow-emerald-500/10 sm:w-auto transition-all transform hover:-translate-y-0.5"
            >
              Create My Meal Plan
            </a>
            <a
              href="#how-it-works"
              className="flex w-full items-center justify-center rounded-xl border border-zinc-200 bg-white px-6 py-4 text-base font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 active:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-850 dark:hover:text-zinc-50 sm:w-auto transition-all transform hover:-translate-y-0.5"
            >
              See How It Works
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
