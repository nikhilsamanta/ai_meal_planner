export default function CTA() {
  return (
    <section className="bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-500 px-6 py-20 shadow-xl dark:from-emerald-700 dark:to-teal-600 sm:px-12 sm:py-28 md:px-16 text-center">
          {/* Background shapes */}
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_45rem_at_top,rgba(255,255,255,0.15),transparent)]" />
          <div className="absolute -top-24 -left-20 -z-10 h-64 w-64 rounded-full bg-white/5 blur-2xl" />
          <div className="absolute -bottom-24 -right-20 -z-10 h-64 w-64 rounded-full bg-white/5 blur-2xl" />

          {/* Content */}
          <div className="mx-auto max-w-2xl">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Ready to plan your week?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-base text-emerald-50 sm:text-lg">
              Take the stress out of meal prep. Get your personalized, budget-friendly meal plan generated in seconds.
            </p>
            <div className="mt-8 flex justify-center">
              <button className="flex items-center justify-center rounded-xl bg-white px-6 py-4 text-base font-semibold text-emerald-800 shadow-md hover:bg-zinc-50 active:bg-zinc-150 transition-all transform hover:-translate-y-0.5">
                Create Your Meal Plan
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
