export default function Features() {
  const featuresList = [
    {
      title: "Personalized Meal Plans",
      description: "Custom recommendations adjusted for your calorie levels, dietary requirements, and tastes.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6 text-emerald-600 dark:text-emerald-400"
        >
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
      ),
    },
    {
      title: "Budget Friendly",
      description: "Optimize ingredients across multiple days to minimize waste and lower your weekly grocery bills.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6 text-emerald-600 dark:text-emerald-400"
        >
          <line x1="12" x2="12" y1="2" y2="22" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
    },
    {
      title: "High Protein Options",
      description: "Perfect for active lifestyles. Easily filter plans to maximize lean proteins and macros.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6 text-emerald-600 dark:text-emerald-400"
        >
          <path d="m6.5 6.5 11 11" />
          <path d="m21 21-1-1" />
          <path d="m3 3 1 1" />
          <path d="m18.5 5.5 3 3-1.5 1.5-3-3Z" />
          <path d="m2.5 15.5 3-3 1.5 1.5-3 3Z" />
          <path d="M16 8.5 8.5 16" />
        </svg>
      ),
    },
    {
      title: "Smart Shopping Lists",
      description: "Auto-consolidate meal items into a single checklist organized by category for stress-free shopping.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6 text-emerald-600 dark:text-emerald-400"
        >
          <path d="M12 11h4" />
          <path d="M12 16h4" />
          <path d="M8 11h.01" />
          <path d="M8 16h.01" />
          <rect width="18" height="18" x="3" y="3" rx="2" />
        </svg>
      ),
    },
    {
      title: "Indian Cuisine Support",
      description: "Rich options ranging from Poha and Upma for breakfast, to traditional Dal, Roti, Paneer, and Pulao.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6 text-emerald-600 dark:text-emerald-400"
        >
          <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2Z" />
          <circle cx="12" cy="12" r="4" />
          <path d="m12 8 1.5 4H12Z" />
          <path d="m12 16-1.5-4H12Z" />
          <path d="m8 12 4 1.5V12Z" />
          <path d="m16 12-4-1.5V12Z" />
        </svg>
      ),
    },
    {
      title: "Reduce Meal Repetition",
      description: "Our clever scheduling algorithm ensures variety throughout the week, so you never get repeat fatigue.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6 text-emerald-600 dark:text-emerald-400"
        >
          <path d="m17 2 4 4-4 4" />
          <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
          <path d="m7 22-4-4 4-4" />
          <path d="M21 13v1a4 4 0 0 1-4 4H3" />
        </svg>
      ),
    },
  ];

  return (
    <section id="features" className="bg-zinc-50 py-20 dark:bg-zinc-950 sm:py-32 scroll-mt-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            Features Tailored For Easy Living
          </h2>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            Get more than just a list of recipes. Our platform is designed to make meal prep and home dining a delight.
          </p>
        </div>

        {/* Features Grid */}
        <div className="mx-auto mt-16 max-w-5xl sm:mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featuresList.map((feature, idx) => (
              <div
                key={idx}
                className="group relative rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 transition-colors group-hover:bg-emerald-100 dark:bg-emerald-950/30 dark:group-hover:bg-emerald-900/40">
                  {feature.icon}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
