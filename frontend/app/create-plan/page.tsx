"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useRouter } from "next/navigation";

const API_BASE = "http://localhost:5000/api";

interface BasketItem {
  _id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  pricePerUnit: number;
  totalItemCost: number;
  inPantry: boolean;
}

interface GroceryBasketData {
  _id: string;
  status: "draft" | "confirmed";
  weeklyBudget: number;
  totalCost: number;
  items: BasketItem[];
}

const CATEGORIES = [
  "All",
  "Produce",
  "Dairy & Eggs",
  "Grains & Pulses",
  "Meat & Seafood",
  "Spices & Condiments",
  "Bakery",
  "Pantry & Oils",
  "Other",
];

export default function CreatePlanPage() {
  const router = useRouter();

  const [basket, setBasket] = useState<GroceryBasketData | null>(null);
  const [weeklyBudget, setWeeklyBudget] = useState<number>(0);
  const [loadingBasket, setLoadingBasket] = useState<boolean>(true);
  const [generatingMeals, setGeneratingMeals] = useState<boolean>(false);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const fetchSuggestedBasket = async () => {
    try {
      setLoadingBasket(true);
      setErrorMsg(null);

      const res = await fetch(`${API_BASE}/groceries/suggest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok && data.success && data.basket) {
        setBasket(data.basket);
        setWeeklyBudget(data.weeklyBudget || data.basket.weeklyBudget);
      } else {
        setErrorMsg(
          data.message || "Failed to generate grocery basket. Make sure dietary preferences are set in profile."
        );
      }
    } catch (err: unknown) {
      console.error("Error fetching grocery basket:", err);
      const message = err instanceof Error ? err.message : "Network error while connecting to server.";
      setErrorMsg(message);
    } finally {
      setLoadingBasket(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    const loadBasket = async () => {
      try {
        const res = await fetch(`${API_BASE}/groceries/suggest`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        const data = await res.json();

        if (ignore) return;
        if (res.ok && data.success && data.basket) {
          setBasket(data.basket);
          setWeeklyBudget(data.weeklyBudget || data.basket.weeklyBudget);
        } else {
          setErrorMsg(
            data.message || "Failed to generate grocery basket. Make sure dietary preferences are set in profile."
          );
        }
      } catch (err: unknown) {
        if (ignore) return;
        console.error("Error fetching grocery basket:", err);
        const message = err instanceof Error ? err.message : "Network error while connecting to server.";
        setErrorMsg(message);
      } finally {
        if (!ignore) {
          setLoadingBasket(false);
        }
      }
    };

    loadBasket();
    return () => {
      ignore = true;
    };
  }, []);

  // Update item in backend & state
  const handleUpdateItem = useCallback(
    async (itemId: string, updates: { pricePerUnit?: number; quantity?: number; inPantry?: boolean }) => {
      if (!basket) return;

      // Optimistic update locally
      setBasket((prev) => {
        if (!prev) return null;
        const updatedItems = prev.items.map((item) => {
          if (item._id === itemId) {
            const nextPrice = updates.pricePerUnit !== undefined ? updates.pricePerUnit : item.pricePerUnit;
            const nextQty = updates.quantity !== undefined ? updates.quantity : item.quantity;
            const nextPantry = updates.inPantry !== undefined ? updates.inPantry : item.inPantry;

            let nextCost = 0;
            if (!nextPantry) {
              const u = item.unit.toLowerCase();
              if (u === "g" || u === "ml") {
                nextCost = (nextQty / 1000) * nextPrice;
              } else {
                nextCost = nextQty * nextPrice;
              }
            }
            nextCost = Math.round(nextCost * 100) / 100;

            return {
              ...item,
              pricePerUnit: nextPrice,
              quantity: nextQty,
              inPantry: nextPantry,
              totalItemCost: nextCost,
            };
          }
          return item;
        });

        const nextTotal = Math.round(
          updatedItems.reduce((acc, i) => acc + i.totalItemCost, 0) * 100
        ) / 100;

        return {
          ...prev,
          items: updatedItems,
          totalCost: nextTotal,
        };
      });

      setUpdatingItemId(itemId);
      setErrorMsg(null);

      try {
        const res = await fetch(`${API_BASE}/groceries/update-item-price`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            basketId: basket._id,
            itemId,
            ...updates,
          }),
        });

        const data = await res.json();
        if (res.ok && data.success && data.basket) {
          setBasket(data.basket);
        } else {
          setErrorMsg(data.message || "Failed to update item price.");
        }
      } catch (err: unknown) {
        console.error("Error updating basket item:", err);
        setErrorMsg("Failed to sync item update with server.");
      } finally {
        setUpdatingItemId(null);
      }
    },
    [basket]
  );

  // Generate Meals from Locked Basket
  const handleGenerateMeals = async () => {
    if (!basket) return;

    try {
      setGeneratingMeals(true);
      setErrorMsg(null);

      const res = await fetch(`${API_BASE}/meals/generate-from-basket`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ basketId: basket._id }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Phase 4 Success Redirection to /meal-plan
        router.push("/meal-plan");
      } else {
        setErrorMsg(
          data.message ||
            "Total grocery cost exceeds weekly budget. Adjust quantities or swap items before generating meals."
        );
      }
    } catch (err: unknown) {
      console.error("Error generating meals from basket:", err);
      const message = err instanceof Error ? err.message : "Failed to connect to meal generator server.";
      setErrorMsg(message);
    } finally {
      setGeneratingMeals(false);
    }
  };

  const totalCost = basket ? basket.totalCost : 0;
  const isOverBudget = basket ? totalCost > weeklyBudget : false;
  const diffBudget = Math.abs(Math.round(totalCost - weeklyBudget));

  // Check if essential items are missing unit prices
  const unpricedItemsCount = basket
    ? basket.items.filter((i) => !i.inPantry && i.pricePerUnit <= 0).length
    : 0;

  const filteredItems = basket
    ? activeCategory === "All"
      ? basket.items
      : basket.items.filter((item) => item.category === activeCategory)
    : [];

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
        <Navbar />

        <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <Link
                href="/dashboard"
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline mb-2 inline-block"
              >
                &larr; Back to Dashboard
              </Link>
              <h1 className="text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
                Step 1: Grocery Basket & Price Lock
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Enter your local unit prices below. AI will strictly generate your 7-day meal plan using only these items within budget.
              </p>
            </div>

            <button
              onClick={fetchSuggestedBasket}
              disabled={loadingBasket || generatingMeals}
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-semibold bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
            >
              🔄 Re-suggest AI Basket
            </button>
          </div>

          {errorMsg && (
            <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-2xl text-red-700 dark:text-red-300 text-sm font-medium flex items-center justify-between">
              <span>⚠️ {errorMsg}</span>
              <button
                onClick={() => setErrorMsg(null)}
                className="text-xs font-bold text-red-500 hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Top Summary Card */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Target Weekly Budget */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Target Weekly Budget
              </span>
              <div className="text-3xl font-black text-zinc-900 dark:text-white mt-1">
                ₹{weeklyBudget}
              </div>
              <span className="text-xs text-zinc-400">Quarter of monthly target</span>
            </div>

            {/* Current Total Cost */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Current Basket Total
              </span>
              <div
                className={`text-3xl font-black mt-1 ${
                  isOverBudget ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                ₹{totalCost}
              </div>
              <span className="text-xs text-zinc-400">Exact sum (quantity &times; unit price)</span>
            </div>

            {/* Status Badge & CTA info */}
            <div className="flex flex-col justify-center items-start md:items-end gap-2">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Budget Status
              </span>
              {isOverBudget ? (
                <div className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900">
                  Over Budget by ₹{diffBudget} ❌
                </div>
              ) : (
                <div className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                  Within Budget ✅
                </div>
              )}
              {unpricedItemsCount > 0 && (
                <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                  💡 {unpricedItemsCount} item(s) unpriced (set prices or check &quot;I have this&quot;)
                </span>
              )}
            </div>
          </div>

          {/* Loading Skeleton */}
          {loadingBasket ? (
            <div className="py-20 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-600 mb-4"></div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Nutritionist AI is crafting your recommended 7-day grocery basket...
              </p>
            </div>
          ) : basket ? (
            <div className="space-y-6">
              {/* Category Filter Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                      activeCategory === cat
                        ? "bg-emerald-600 text-white shadow-md"
                        : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Items Table / Cards */}
              <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-zinc-700 dark:text-zinc-300">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-xs uppercase font-bold text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                      <tr>
                        <th className="px-6 py-4">Item Name & Category</th>
                        <th className="px-6 py-4">Quantity</th>
                        <th className="px-6 py-4 text-center">In Pantry</th>
                        <th className="px-6 py-4">Unit Price (₹)</th>
                        <th className="px-6 py-4 text-right">Line Total (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                      {filteredItems.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                            No items found in this category.
                          </td>
                        </tr>
                      ) : (
                        filteredItems.map((item) => (
                          <tr
                            key={item._id}
                            className={`transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 ${
                              item.inPantry ? "opacity-60 bg-zinc-50/30 dark:bg-zinc-900/40" : ""
                            }`}
                          >
                            {/* Item Name & Category */}
                            <td className="px-6 py-4">
                              <div className="font-bold text-zinc-900 dark:text-white capitalize">
                                {item.name}
                              </div>
                              <span className="inline-block mt-1 px-2.5 py-0.5 text-[10px] font-semibold rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/50">
                                {item.category}
                              </span>
                            </td>

                            {/* Quantity Controls */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdateItem(item._id, {
                                      quantity: Math.max(0.1, Number((item.quantity - (item.unit === "g" || item.unit === "ml" ? 50 : 0.5)).toFixed(2))),
                                    })
                                  }
                                  disabled={updatingItemId === item._id}
                                  className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center font-bold text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  step={item.unit === "g" || item.unit === "ml" ? "10" : "0.5"}
                                  min="0.1"
                                  value={item.quantity}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    if (!isNaN(val)) {
                                      handleUpdateItem(item._id, { quantity: val });
                                    }
                                  }}
                                  className="w-20 px-2 py-1 text-center font-semibold rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 min-w-[28px]">
                                  {item.unit}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdateItem(item._id, {
                                      quantity: Number((item.quantity + (item.unit === "g" || item.unit === "ml" ? 50 : 0.5)).toFixed(2)),
                                    })
                                  }
                                  disabled={updatingItemId === item._id}
                                  className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center font-bold text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
                                >
                                  +
                                </button>
                              </div>
                            </td>

                            {/* In Pantry Checkbox */}
                            <td className="px-6 py-4 text-center">
                              <label className="inline-flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={item.inPantry}
                                  onChange={(e) =>
                                    handleUpdateItem(item._id, { inPantry: e.target.checked })
                                  }
                                  className="w-4 h-4 text-emerald-600 rounded border-zinc-300 focus:ring-emerald-500 cursor-pointer"
                                />
                                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 select-none">
                                  In Pantry
                                </span>
                              </label>
                            </td>

                            {/* Unit Price Input */}
                            <td className="px-6 py-4">
                              <div className="relative flex items-center max-w-[140px]">
                                <span className="absolute left-3 text-zinc-400 text-xs font-bold">
                                  ₹
                                </span>
                                <input
                                  type="number"
                                  min="0"
                                  placeholder="0"
                                  disabled={item.inPantry}
                                  value={item.pricePerUnit === 0 ? "" : item.pricePerUnit}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    handleUpdateItem(item._id, { pricePerUnit: isNaN(val) ? 0 : val });
                                  }}
                                  className="w-full pl-7 pr-12 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                                />
                                <span className="absolute right-2 text-[10px] font-semibold text-zinc-400 uppercase">
                                  /{item.unit === "g" ? "kg" : item.unit === "ml" ? "L" : item.unit}
                                </span>
                              </div>
                            </td>

                            {/* Line Total */}
                            <td className="px-6 py-4 text-right">
                              <div className="font-extrabold text-zinc-900 dark:text-white text-base">
                                {item.inPantry ? (
                                  <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                                    ₹0 (Pantry)
                                  </span>
                                ) : (
                                  `₹${item.totalItemCost}`
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-lg font-extrabold text-zinc-950 dark:text-white">
                    Ready to Generate 21 Meals?
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Locking the budget forces Chef AI to generate Monday through Sunday recipes using strictly your priced ingredients.
                  </p>
                </div>

                <button
                  onClick={handleGenerateMeals}
                  disabled={isOverBudget || generatingMeals || loadingBasket}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-base shadow-xl hover:from-emerald-700 hover:to-teal-700 active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generatingMeals ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
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
                      <span>Chef AI is composing 21 meals from your selected groceries...</span>
                    </>
                  ) : (
                    <>
                      <span>🔒 Lock Budget & Generate 7-Day Plan</span>
                      <span className="text-emerald-200">&rarr;</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : null}
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
