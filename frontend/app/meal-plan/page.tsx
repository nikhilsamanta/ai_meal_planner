"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";

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

export default function MealPlanPage() {
  const { user } = useAuth();
  const [activePlan, setActivePlan] = useState<MealPlanData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    const fetchMealPlan = async () => {
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
      } catch (err: unknown) {
        if (ignore) return;
        console.error("Error loading active meal plan:", err);
        setErrorMsg("Failed to connect to meal plan service.");
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchMealPlan();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
        <Navbar />

        <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
            <div>
              <div className="mb-2">
                <Link
                  href="/dashboard"
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-450 hover:underline"
                >
                  &larr; Back to Dashboard
                </Link>
              </div>
              <h1 className="text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
                7-Day Weekly Meal Schedule
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Personalized AI meal plan generated for {user?.name}.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/shopping-list"
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 hover:bg-emerald-100 transition-colors"
              >
                🛒 View Shopping List
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-600"></div>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">Loading your meal schedule...</span>
            </div>
          ) : errorMsg || !activePlan || !activePlan.days || activePlan.days.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 p-12 text-center rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm max-w-2xl mx-auto my-12">
              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                🍲
              </div>
              <h2 className="text-2xl font-bold text-zinc-950 dark:text-white mb-2">
                No Active Meal Plan Found
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
                You haven&apos;t generated a weekly meal plan yet. Use our Gemini AI generator on the dashboard to create one based on your preferences.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-all shadow-md"
              >
                Go to Dashboard & Generate Plan &rarr;
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {activePlan.days.map((dayData, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden"
                >
                  {/* Day Header */}
                  <div className="bg-zinc-100 dark:bg-zinc-800/80 px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-wide">
                      {dayData.day}
                    </h2>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-900">
                      Day {index + 1}
                    </span>
                  </div>

                  {/* Meals Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-200 dark:divide-zinc-800">
                    {/* Breakfast */}
                    <div className="p-6 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-md border border-amber-200 dark:border-amber-900/60">
                            Breakfast 🌅
                          </span>
                        </div>
                        <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white">
                          {dayData.breakfast?.title}
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
                          {dayData.breakfast?.description}
                        </p>
                      </div>

                      {/* Ingredients */}
                      <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/60">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
                          Ingredients:
                        </h4>
                        <ul className="space-y-1 text-xs text-zinc-700 dark:text-zinc-300">
                          {dayData.breakfast?.ingredients?.map((ing, idx) => (
                            <li key={idx} className="flex justify-between">
                              <span>• {ing.name}</span>
                              <span className="font-medium text-zinc-500 dark:text-zinc-400">
                                {ing.amount} {ing.unit}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Lunch */}
                    <div className="p-6 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-900/60">
                            Lunch ☀️
                          </span>
                        </div>
                        <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white">
                          {dayData.lunch?.title}
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
                          {dayData.lunch?.description}
                        </p>
                      </div>

                      {/* Ingredients */}
                      <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/60">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
                          Ingredients:
                        </h4>
                        <ul className="space-y-1 text-xs text-zinc-700 dark:text-zinc-300">
                          {dayData.lunch?.ingredients?.map((ing, idx) => (
                            <li key={idx} className="flex justify-between">
                              <span>• {ing.name}</span>
                              <span className="font-medium text-zinc-500 dark:text-zinc-400">
                                {ing.amount} {ing.unit}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Dinner */}
                    <div className="p-6 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-900/60">
                            Dinner 🌙
                          </span>
                        </div>
                        <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white">
                          {dayData.dinner?.title}
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
                          {dayData.dinner?.description}
                        </p>
                      </div>

                      {/* Ingredients */}
                      <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/60">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
                          Ingredients:
                        </h4>
                        <ul className="space-y-1 text-xs text-zinc-700 dark:text-zinc-300">
                          {dayData.dinner?.ingredients?.map((ing, idx) => (
                            <li key={idx} className="flex justify-between">
                              <span>• {ing.name}</span>
                              <span className="font-medium text-zinc-500 dark:text-zinc-400">
                                {ing.amount} {ing.unit}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
