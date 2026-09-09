export default function MealPlanPreview() {
  const mealPlan = [
    {
      day: "Monday",
      meals: [
        { type: "Breakfast", name: "Poha", calories: "320 kcal", protein: "8g", typeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300" },
        { type: "Lunch", name: "Dal + Roti", calories: "450 kcal", protein: "18g", typeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300" },
        { type: "Dinner", name: "Paneer Tikka Masala", calories: "550 kcal", protein: "22g", typeColor: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300" },
      ],
    },
    {
      day: "Tuesday",
      meals: [
        { type: "Breakfast", name: "Upma", calories: "340 kcal", protein: "7g", typeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300" },
        { type: "Lunch", name: "Rajma Rice", calories: "480 kcal", protein: "16g", typeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300" },
        { type: "Dinner", name: "Veg Pulao + Raita", calories: "420 kcal", protein: "12g", typeColor: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300" },
      ],
    },
  ];

  return (
    <section id="meal-plan-preview" className="bg-white py-20 dark:bg-black sm:py-32 scroll-mt-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          {/* Text Content */}
          <div className="lg:col-span-5">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-850 ring-1 ring-emerald-600/20 dark:bg-emerald-950/30 dark:text-emerald-300 dark:ring-emerald-500/30 mb-6">
              Interactive Preview
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
              Your Personalized Weekly Schedule
            </h2>
            <p className="mt-4 text-base text-zinc-600 dark:text-zinc-400">
              Here is a sneak peek of what your dashboard looks like. We design variety into every day, matching authentic flavors, nutrition parameters, and your prep time preferences.
            </p>
            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">✓</span>
                <p className="text-sm text-zinc-600 dark:text-zinc-400"><strong>Flexible edits:</strong> Swap meals or recalculate portions on the fly.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">✓</span>
                <p className="text-sm text-zinc-600 dark:text-zinc-400"><strong>Prep directions:</strong> Step-by-step guidance for quick execution.</p>
              </div>
            </div>
          </div>

          {/* Interactive Mockup */}
          <div className="lg:col-span-7">
            <div className="relative rounded-2xl border border-zinc-200 bg-zinc-50 p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900/60 lg:p-8">
              {/* Header inside Mockup */}
              <div className="mb-6 flex flex-col justify-between gap-4 border-b border-zinc-200 pb-4 dark:border-zinc-800 sm:flex-row sm:items-center">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Active Plan</span>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Vegetarian High-Protein Week</h3>
                </div>
                <div className="flex gap-2">
                  <span className="inline-flex items-center rounded-lg bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    Active
                  </span>
                  <span className="inline-flex items-center rounded-lg bg-zinc-200 px-2 py-1 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-350">
                    Aug 31 - Sep 6
                  </span>
                </div>
              </div>

              {/* Days Columns */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {mealPlan.map((dayPlan, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-850 dark:bg-zinc-950"
                  >
                    <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-4 flex items-center gap-1.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        className="h-4 w-4"
                      >
                        <rect width="18" height="18" x="3" y="4" rx="2" />
                        <path d="M16 2v4M8 2v4M3 10h18" />
                      </svg>
                      {dayPlan.day}
                    </h4>

                    <div className="space-y-3">
                      {dayPlan.meals.map((meal, mIdx) => (
                        <div
                          key={mIdx}
                          className="group relative rounded-lg border border-zinc-100 bg-zinc-50/50 p-3 hover:bg-zinc-50 dark:border-zinc-900 dark:bg-zinc-900/30 dark:hover:bg-zinc-900/50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className={`inline-block rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${meal.typeColor}`}>
                              {meal.type}
                            </span>
                            <span className="text-[10px] text-zinc-400">{meal.calories}</span>
                          </div>
                          <h5 className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-50">{meal.name}</h5>
                          <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                            <span>Protein: {meal.protein}</span>
                            <span className="text-emerald-600 dark:text-emerald-400 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">View recipe →</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
