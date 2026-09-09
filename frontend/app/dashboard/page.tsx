"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useRouter } from "next/navigation";

const API_MEAL_PLAN_URL = "http://localhost:5000/api/meal-plan";

interface Ingredient {
  name: string;
  amount: number;
  unit: string;
}

interface MealItem {
  title: string;
  description: string;
  ingredients: Ingredient[];
}

interface DayPlan {
  day: string;
  breakfast: MealItem;
  lunch: MealItem;
  dinner: MealItem;
}

interface MealPlanData {
  _id: string;
  weekStartDate: string;
  status: string;
  days: DayPlan[];
}

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const [activePlan, setActivePlan] = useState<MealPlanData | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<boolean>(true);
  const [generating] = useState<boolean>(false);
  const [errorMsg] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    const fetchCurrentPlan = async () => {
      try {
        const res = await fetch(`${API_MEAL_PLAN_URL}/current`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();

        if (ignore) return;
        if (res.ok && data.success && data.mealPlan) {
          setActivePlan(data.mealPlan);
        } else {
          setActivePlan(null);
        }
      } catch (err) {
        if (ignore) return;
        console.error("Error fetching current meal plan:", err);
        setActivePlan(null);
      } finally {
        if (!ignore) {
          setLoadingPlan(false);
        }
      }
    };

    fetchCurrentPlan();
    return () => {
      ignore = true;
    };
  }, []);

  // Navigate to Grocery-First Create Plan wizard
  const handleGeneratePlan = () => {
    router.push("/create-plan");
  };

  // Get today's day name to display today's snapshot
  const todayDayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const todayMeals =
    activePlan?.days?.find(
      (d) => d.day.toLowerCase() === todayDayName.toLowerCase()
    ) || activePlan?.days?.[0];

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
        <Navbar />

        <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Welcome back, {user?.name}! 👋
              </h1>
              <p className="mt-2 text-emerald-100 text-base max-w-xl">
                Ready to plan your healthy meals for the week? Generate a customized AI meal schedule in seconds.
              </p>
            </div>

            {/* AI Generator Button */}
            <div className="flex-shrink-0">
              <button
                onClick={handleGeneratePlan}
                disabled={generating}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-white text-emerald-700 hover:bg-emerald-50 active:scale-98 font-bold text-base shadow-lg transition-all disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-emerald-600"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Gemini AI is crafting your plan...</span>
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5 text-emerald-600"
                    >
                      <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.465 7.89l.813-2.846A.75.75 0 019 4.5z" clipRule="evenodd" />
                    </svg>
                    <span>Create Plan (Grocery-First)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-2xl text-red-800 dark:text-red-400 text-sm font-medium">
              {errorMsg}
            </div>
          )}

          {/* Quick Snapshot of Today's Meals */}
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-extrabold text-zinc-950 dark:text-white">
                  Today&apos;s Meal Snapshot
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  {activePlan ? `Planned for ${todayMeals?.day || "Today"}` : "No active meal plan found"}
                </p>
              </div>
              {activePlan && (
                <Link
                  href="/meal-plan"
                  className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  View Full 7-Day Plan &rarr;
                </Link>
              )}
            </div>

            {loadingPlan ? (
              <div className="py-12 flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-600"></div>
              </div>
            ) : activePlan && todayMeals ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Breakfast */}
                <div className="p-6 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/50 flex flex-col justify-between">
                  <div>
                    <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 rounded-full mb-3">
                      Breakfast 🌅
                    </span>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                      {todayMeals.breakfast.title}
                    </h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 line-clamp-3">
                      {todayMeals.breakfast.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-amber-200/50 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 font-medium">
                    {todayMeals.breakfast.ingredients.length} ingredients needed
                  </div>
                </div>

                {/* Lunch */}
                <div className="p-6 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/50 flex flex-col justify-between">
                  <div>
                    <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 rounded-full mb-3">
                      Lunch ☀️
                    </span>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                      {todayMeals.lunch.title}
                    </h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 line-clamp-3">
                      {todayMeals.lunch.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-emerald-200/50 dark:border-emerald-900/40 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                    {todayMeals.lunch.ingredients.length} ingredients needed
                  </div>
                </div>

                {/* Dinner */}
                <div className="p-6 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/50 flex flex-col justify-between">
                  <div>
                    <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-950/60 rounded-full mb-3">
                      Dinner 🌙
                    </span>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                      {todayMeals.dinner.title}
                    </h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 line-clamp-3">
                      {todayMeals.dinner.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-indigo-200/50 dark:border-indigo-900/40 text-xs text-indigo-800 dark:text-indigo-300 font-medium">
                    {todayMeals.dinner.ingredients.length} ingredients needed
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 px-4 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-4">
                  You haven&apos;t generated a meal plan yet. Click the button above to generate your first AI meal plan!
                </p>
                <Link
                  href="/profile"
                  className="inline-flex items-center text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Set Dietary Preferences First &rarr;
                </Link>
              </div>
            )}
          </div>

          {/* Quick Navigation Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Link
              href="/meal-plan"
              className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all group"
            >
              <h3 className="text-lg font-bold text-zinc-950 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                📅 Weekly Meal Plan
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                Browse all 7 days of breakfast, lunch, and dinner recipes.
              </p>
            </Link>

            <Link
              href="/shopping-list"
              className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all group"
            >
              <h3 className="text-lg font-bold text-zinc-950 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                🛒 Shopping List
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                Consolidated grocery checklist categorized by department.
              </p>
            </Link>

            <Link
              href="/profile"
              className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all group"
            >
              <h3 className="text-lg font-bold text-zinc-950 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                ⚙️ Dietary Preferences
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                Adjust family size, budget, allergies, and protein targets.
              </p>
            </Link>
          </div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
