export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Tell us your preferences",
      description: "Input diet type, calorie goals, allergies, and ingredient likes or dislikes for your household.",
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
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      ),
    },
    {
      number: "02",
      title: "Get your personalized meal plan",
      description: "Receive a tailored 7-day calendar complete with recipes, breakfast, lunch, and dinner suggestions.",
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
          <path d="M8 2v4" />
          <path d="M16 2v4" />
          <rect width="18" height="18" x="3" y="4" rx="2" />
          <path d="M3 10h18" />
          <path d="M8 14h.01" />
          <path d="M12 14h.01" />
          <path d="M16 14h.01" />
          <path d="M8 18h.01" />
          <path d="M12 18h.01" />
          <path d="M16 18h.01" />
        </svg>
      ),
    },
    {
      number: "03",
      title: "Generate your smart shopping list",
      description: "Get an aggregated ingredients checklist broken down by grocery aisles to save time at the store.",
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
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
          <path d="M3 6h18" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      ),
    },
  ];

  return (
    <section id="how-it-works" className="bg-white py-20 dark:bg-black sm:py-32 scroll-mt-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            Healthy Planning in 3 Simple Steps
          </h2>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            Our intelligent assistant makes sure you enjoy delicious, varied meals tailored to your tastebuds without the stress of thinking what to cook daily.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="relative flex flex-col rounded-2xl border border-zinc-200 bg-zinc-50 p-8 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/50"
            >
              {/* Step Badge */}
              <span className="absolute top-4 right-6 text-5xl font-extrabold text-zinc-200/80 dark:text-zinc-800/50 font-mono">
                {step.number}
              </span>

              {/* Icon container */}
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/30">
                {step.icon}
              </div>

              {/* Title and details */}
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                {step.title}
              </h3>
              <p className="mt-3 flex-1 text-base text-zinc-600 dark:text-zinc-400">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
