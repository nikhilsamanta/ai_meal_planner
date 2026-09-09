"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";

const API_PREFERENCES_URL = "http://localhost:5000/api/preferences";

export default function Profile() {
  const { user } = useAuth();

  const [familySize, setFamilySize] = useState<number>(1);
  const [cuisine, setCuisine] = useState<string>("Indian");
  const [diet, setDiet] = useState<string>("Vegetarian");
  const [budgetMonthly, setBudgetMonthly] = useState<number>(5000);
  const [proteinGoal, setProteinGoal] = useState<string>("Moderate");
  const [dislikedFoodsInput, setDislikedFoodsInput] = useState<string>("");
  const [allergiesInput, setAllergiesInput] = useState<string>("");
  const [mealRepetition, setMealRepetition] = useState<string>("Low");

  const [loadingPref, setLoadingPref] = useState<boolean>(true);
  const [savingPref, setSavingPref] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Fetch user preferences on mount
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        setLoadingPref(true);
        const res = await fetch(API_PREFERENCES_URL, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();

        if (res.ok && data.success && data.preferences) {
          const pref = data.preferences;
          if (pref.familySize) setFamilySize(pref.familySize);
          if (pref.cuisine) setCuisine(pref.cuisine);
          if (pref.diet) setDiet(pref.diet);
          if (pref.budgetMonthly !== undefined) setBudgetMonthly(pref.budgetMonthly);
          if (pref.proteinGoal) setProteinGoal(pref.proteinGoal);
          if (pref.mealRepetition) setMealRepetition(pref.mealRepetition);
          if (Array.isArray(pref.dislikedFoods)) {
            setDislikedFoodsInput(pref.dislikedFoods.join(", "));
          }
          if (Array.isArray(pref.allergies)) {
            setAllergiesInput(pref.allergies.join(", "));
          }
        }
      } catch (err) {
        console.error("Failed to load user preferences:", err);
      } finally {
        setLoadingPref(false);
      }
    };

    fetchPreferences();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPref(true);
    setStatusMessage(null);

    const dislikedFoods = dislikedFoodsInput
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    const allergies = allergiesInput
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    const payload = {
      familySize: Number(familySize),
      cuisine,
      diet,
      budgetMonthly: Number(budgetMonthly),
      proteinGoal,
      dislikedFoods,
      allergies,
      mealRepetition,
    };

    try {
      const res = await fetch(API_PREFERENCES_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatusMessage({
          type: "success",
          text: "Dietary preferences saved successfully! Future meal plans will be customized using these settings.",
        });
      } else {
        setStatusMessage({
          type: "error",
          text: data.message || "Failed to save preferences.",
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Network error while saving preferences.";
      setStatusMessage({
        type: "error",
        text: message,
      });
    } finally {
      setSavingPref(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
        <Navbar />

        <main className="flex-grow max-w-4xl w-full mx-auto px-4 py-12">
          <div className="mb-6">
            <Link
              href="/dashboard"
              className="text-sm font-semibold text-emerald-600 dark:text-emerald-450 hover:underline"
            >
              &larr; Back to Dashboard
            </Link>
          </div>

          <div className="space-y-8">
            {/* User Account Info */}
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <h1 className="text-3xl font-extrabold text-zinc-950 dark:text-white mb-2">
                My Profile
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">
                Manage your account credentials and AI meal planning preferences.
              </p>

              <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">
                  Account Details
                </h3>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-3">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Full Name
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-zinc-900 dark:text-white bg-zinc-50 dark:bg-zinc-950 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      {user?.name}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Email Address
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-zinc-900 dark:text-white bg-zinc-50 dark:bg-zinc-950 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      {user?.email}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Account ID
                    </dt>
                    <dd className="mt-1 text-xs font-mono text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-950 px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 truncate">
                      {user?.id}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* AI Preferences Form */}
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-zinc-950 dark:text-white">
                  Dietary & Meal Preferences
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  Customize the AI engine&apos;s generation constraints for your weekly meal plans.
                </p>
              </div>

              {statusMessage && (
                <div
                  className={`mb-6 p-4 rounded-xl text-sm font-medium border ${
                    statusMessage.type === "success"
                      ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 text-emerald-800 dark:text-emerald-400"
                      : "bg-red-50 dark:bg-red-950/30 border-red-200 text-red-800 dark:text-red-400"
                  }`}
                >
                  {statusMessage.text}
                </div>
              )}

              {loadingPref ? (
                <div className="py-12 flex justify-center items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-600"></div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {/* Family Size */}
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                        Family Size (Servings)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        required
                        value={familySize}
                        onChange={(e) => setFamilySize(Number(e.target.value))}
                        className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-2.5 text-zinc-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    {/* Monthly Budget */}
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                        Monthly Grocery Budget (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="500"
                        required
                        value={budgetMonthly}
                        onChange={(e) => setBudgetMonthly(Number(e.target.value))}
                        className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-2.5 text-zinc-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    {/* Cuisine */}
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                        Cuisine Preference
                      </label>
                      <select
                        value={cuisine}
                        onChange={(e) => setCuisine(e.target.value)}
                        className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-2.5 text-zinc-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="Indian">Indian</option>
                        <option value="Mediterranean">Mediterranean</option>
                        <option value="Mexican">Mexican</option>
                        <option value="Italian">Italian</option>
                        <option value="Asian">Asian</option>
                        <option value="American">American</option>
                        <option value="Continental">Continental</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* Diet */}
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                        Dietary Type
                      </label>
                      <select
                        value={diet}
                        onChange={(e) => setDiet(e.target.value)}
                        className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-2.5 text-zinc-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="Vegetarian">Vegetarian</option>
                        <option value="Non-Vegetarian">Non-Vegetarian</option>
                        <option value="Eggetarian">Eggetarian</option>
                        <option value="Vegan">Vegan</option>
                      </select>
                    </div>

                    {/* Protein Goal */}
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                        Protein Goal
                      </label>
                      <select
                        value={proteinGoal}
                        onChange={(e) => setProteinGoal(e.target.value)}
                        className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-2.5 text-zinc-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="Standard">Standard Protein</option>
                        <option value="Moderate">Moderate Protein</option>
                        <option value="High">High Protein</option>
                      </select>
                    </div>

                    {/* Meal Repetition */}
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                        Meal Repetition / Variety
                      </label>
                      <select
                        value={mealRepetition}
                        onChange={(e) => setMealRepetition(e.target.value)}
                        className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-2.5 text-zinc-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="Low">Low (High Variety, New Dishes)</option>
                        <option value="Medium">Medium (Balanced)</option>
                        <option value="High">High (Allow Batch Cooking)</option>
                      </select>
                    </div>
                  </div>

                  {/* Disliked Foods */}
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                      Disliked Foods (Comma separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mushroom, Brinjal, Karela, Olives"
                      value={dislikedFoodsInput}
                      onChange={(e) => setDislikedFoodsInput(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-2.5 text-zinc-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Allergies */}
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                      Allergies & Intolerances (Comma separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Peanut, Shellfish, Gluten, Dairy"
                      value={allergiesInput}
                      onChange={(e) => setAllergiesInput(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-2.5 text-zinc-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={savingPref}
                      className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md transition-all disabled:opacity-50"
                    >
                      {savingPref ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
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
                          Saving Preferences...
                        </>
                      ) : (
                        "Save Preferences"
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
