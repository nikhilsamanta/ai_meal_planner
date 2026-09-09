"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";

const API_SHOPPING_LIST_URL = "http://localhost:5000/api/shopping-list";
const API_PRICES_URL = "http://localhost:5000/api/prices";

interface ShoppingItem {
  _id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  inPantry: boolean;
  purchased: boolean;
  estimatedCost?: number;
}

interface ShoppingListData {
  _id: string;
  mealPlanId: string;
  totalEstimatedCost?: number;
  weeklyBudget?: number;
  items: ShoppingItem[];
}

interface IngredientPrice {
  _id: string;
  name: string;
  pricePerUnit: number;
  unit: string;
}

export default function ShoppingListPage() {
  const [shoppingList, setShoppingList] = useState<ShoppingListData | null>(null);
  const [prices, setPrices] = useState<IngredientPrice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPriceManager, setShowPriceManager] = useState<boolean>(false);

  // Price manager form state
  const [newPriceName, setNewPriceName] = useState<string>("");
  const [newPriceRate, setNewPriceRate] = useState<string>("");
  const [newPriceUnit, setNewPriceUnit] = useState<string>("kg");
  const [savingPrice, setSavingPrice] = useState<boolean>(false);

  // Fetch shopping list & custom prices
  const fetchShoppingList = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await fetch(API_SHOPPING_LIST_URL, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();

      if (res.ok && data.success && data.shoppingList) {
        setShoppingList(data.shoppingList);
      } else {
        setShoppingList(null);
      }
    } catch (err: unknown) {
      console.error("Error fetching shopping list:", err);
      setErrorMsg("Failed to connect to shopping list service.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomPrices = async () => {
    try {
      const res = await fetch(API_PRICES_URL, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.prices)) {
        setPrices(data.prices);
      }
    } catch (err) {
      console.error("Error loading custom ingredient prices:", err);
    }
  };

  useEffect(() => {
    let ignore = false;
    const loadInitialData = async () => {
      try {
        const [listRes, pricesRes] = await Promise.all([
          fetch(API_SHOPPING_LIST_URL, {
            method: "GET",
            credentials: "include",
          }),
          fetch(API_PRICES_URL, {
            method: "GET",
            credentials: "include",
          }),
        ]);

        const listData = await listRes.json();
        const pricesData = await pricesRes.json();

        if (ignore) return;

        if (listRes.ok && listData.success && listData.shoppingList) {
          setShoppingList(listData.shoppingList);
        } else {
          setShoppingList(null);
        }

        if (pricesRes.ok && pricesData.success && Array.isArray(pricesData.prices)) {
          setPrices(pricesData.prices);
        }
      } catch (err: unknown) {
        if (ignore) return;
        console.error("Error loading shopping list or prices:", err);
        setErrorMsg("Failed to connect to shopping list service.");
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadInitialData();
    return () => {
      ignore = true;
    };
  }, []);

  // Toggle inPantry or purchased flag
  const handleToggleItem = async (
    itemId: string,
    updates: { inPantry?: boolean; purchased?: boolean }
  ) => {
    if (!shoppingList) return;

    // Optimistic UI Update
    setShoppingList((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map((item) =>
          item._id === itemId ? { ...item, ...updates } : item
        ),
      };
    });

    try {
      const res = await fetch(`${API_SHOPPING_LIST_URL}/item/${itemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updates),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        fetchShoppingList();
      }
    } catch (err) {
      console.error("Error updating item status:", err);
      fetchShoppingList();
    }
  };

  // Reset list flags
  const handleResetList = async () => {
    try {
      const res = await fetch(`${API_SHOPPING_LIST_URL}/reset`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.success && data.shoppingList) {
        setShoppingList(data.shoppingList);
      }
    } catch (err) {
      console.error("Error resetting shopping list:", err);
    }
  };

  // Add custom price entry
  const handleAddPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPriceName.trim() || !newPriceRate) return;

    try {
      setSavingPrice(true);
      const res = await fetch(API_PRICES_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify([
          {
            name: newPriceName.trim(),
            pricePerUnit: Number(newPriceRate),
            unit: newPriceUnit,
          },
        ]),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setNewPriceName("");
        setNewPriceRate("");
        fetchCustomPrices();
      }
    } catch (err) {
      console.error("Error adding price:", err);
    } finally {
      setSavingPrice(false);
    }
  };

  // Delete custom price entry
  const handleDeletePrice = async (id: string) => {
    try {
      const res = await fetch(`${API_PRICES_URL}/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchCustomPrices();
      }
    } catch (err) {
      console.error("Error deleting price entry:", err);
    }
  };

  // Group items by Category
  const categoriesOrder = [
    "Produce",
    "Dairy & Eggs",
    "Grains & Pulses",
    "Meat & Seafood",
    "Spices & Condiments",
    "Bakery",
    "Pantry & Oils",
    "Other",
  ];

  const groupedItems = categoriesOrder.reduce((acc, cat) => {
    const itemsInCat = shoppingList?.items.filter((item) => item.category === cat) || [];
    if (itemsInCat.length > 0) {
      acc[cat] = itemsInCat;
    }
    return acc;
  }, {} as Record<string, ShoppingItem[]>);

  // Budget Calculations
  const totalEstimatedCost = shoppingList?.totalEstimatedCost || 0;
  const weeklyBudget = shoppingList?.weeklyBudget || 1250;
  const budgetRatio = weeklyBudget > 0 ? Math.min((totalEstimatedCost / weeklyBudget) * 100, 100) : 0;
  const isOverBudget = totalEstimatedCost > weeklyBudget;

  const totalItems = shoppingList?.items.length || 0;
  const purchasedCount = shoppingList?.items.filter((i) => i.purchased).length || 0;
  const inPantryCount = shoppingList?.items.filter((i) => i.inPantry).length || 0;

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
        <Navbar />

        <main className="flex-grow max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
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
                Consolidated Shopping Checklist 🛒
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Aggregated grocery list automatically built from your active 7-day meal plan.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPriceManager(!showPriceManager)}
                className="text-xs font-semibold px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 hover:bg-emerald-100 transition-colors"
              >
                🏷️ Custom Prices ({prices.length})
              </button>

              {totalItems > 0 && (
                <button
                  onClick={handleResetList}
                  className="text-xs font-semibold px-4 py-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
                >
                  Reset Checklist
                </button>
              )}
            </div>
          </div>

          {/* Budget Optimization Progress Bar */}
          {totalItems > 0 && (
            <div className="mb-8 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h3 className="text-base font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                    <span>Weekly Budget Optimization</span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        isOverBudget
                          ? "bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200"
                          : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200"
                      }`}
                    >
                      {isOverBudget ? "Over Budget" : "Within Target"}
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Calculated using your custom ingredient prices and estimated market rates.
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-black text-zinc-900 dark:text-white">
                    ₹{totalEstimatedCost.toLocaleString()}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium block">
                    Target: ₹{weeklyBudget.toLocaleString()} / week
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    isOverBudget ? "bg-red-500" : "bg-emerald-500"
                  }`}
                  style={{ width: `${budgetRatio}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Custom Price Manager Modal / Drawer */}
          {showPriceManager && (
            <div className="mb-8 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-emerald-200 dark:border-emerald-900 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-zinc-950 dark:text-white">
                  🏷️ Manage Custom Ingredient Prices
                </h3>
                <button
                  onClick={() => setShowPriceManager(false)}
                  className="text-xs font-semibold text-zinc-400 hover:text-zinc-600"
                >
                  Close ✕
                </button>
              </div>

              <form onSubmit={handleAddPrice} className="flex flex-col sm:flex-row gap-3 mb-6">
                <input
                  type="text"
                  placeholder="Ingredient (e.g. Paneer, Milk)"
                  required
                  value={newPriceName}
                  onChange={(e) => setNewPriceName(e.target.value)}
                  className="flex-grow rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3.5 py-2 text-sm text-zinc-900 dark:text-white"
                />
                <input
                  type="number"
                  placeholder="Price (₹)"
                  required
                  min="0"
                  value={newPriceRate}
                  onChange={(e) => setNewPriceRate(e.target.value)}
                  className="w-full sm:w-28 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3.5 py-2 text-sm text-zinc-900 dark:text-white"
                />
                <select
                  value={newPriceUnit}
                  onChange={(e) => setNewPriceUnit(e.target.value)}
                  className="w-full sm:w-28 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3.5 py-2 text-sm text-zinc-900 dark:text-white"
                >
                  <option value="kg">per kg</option>
                  <option value="g">per g</option>
                  <option value="L">per L</option>
                  <option value="ml">per ml</option>
                  <option value="pcs">per pcs</option>
                  <option value="dozen">per dozen</option>
                  <option value="pack">per pack</option>
                </select>
                <button
                  type="submit"
                  disabled={savingPrice}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors"
                >
                  {savingPrice ? "Saving..." : "Add Price"}
                </button>
              </form>

              {prices.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {prices.map((p) => (
                    <div
                      key={p._id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs"
                    >
                      <div>
                        <span className="font-bold text-zinc-900 dark:text-white capitalize block truncate">
                          {p.name}
                        </span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          ₹{p.pricePerUnit}/{p.unit}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeletePrice(p._id)}
                        className="text-zinc-400 hover:text-red-500 font-bold ml-2"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-400">No custom ingredient prices added yet.</p>
              )}
            </div>
          )}

          {/* Stats Bar */}
          {totalItems > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-8 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm text-center">
              <div>
                <span className="block text-2xl font-black text-zinc-900 dark:text-white">{totalItems}</span>
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Total Items</span>
              </div>
              <div>
                <span className="block text-2xl font-black text-emerald-600 dark:text-emerald-400">{purchasedCount}</span>
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Purchased</span>
              </div>
              <div>
                <span className="block text-2xl font-black text-teal-600 dark:text-teal-400">{inPantryCount}</span>
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">In Pantry</span>
              </div>
            </div>
          )}

          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-600"></div>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">Loading your shopping checklist...</span>
            </div>
          ) : errorMsg || !shoppingList || shoppingList.items.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 p-12 text-center rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm max-w-2xl mx-auto my-12">
              <div className="w-16 h-16 bg-teal-50 dark:bg-teal-950/40 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                🛒
              </div>
              <h2 className="text-2xl font-bold text-zinc-950 dark:text-white mb-2">
                No Shopping List Available
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
                Generate an AI meal plan on the dashboard first to produce your consolidated grocery list.
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
              {Object.entries(groupedItems).map(([category, items]) => (
                <div
                  key={category}
                  className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden"
                >
                  <div className="bg-zinc-100 dark:bg-zinc-800/80 px-6 py-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <h2 className="text-base font-extrabold text-zinc-900 dark:text-white">
                      {category}
                    </h2>
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-200 dark:bg-zinc-700 px-2.5 py-0.5 rounded-full">
                      {items.length} {items.length === 1 ? "item" : "items"}
                    </span>
                  </div>

                  <ul className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                    {items.map((item, idx) => {
                      const isDone = item.purchased || item.inPantry;
                      const itemId = item._id || item.name;

                      return (
                        <li
                          key={item._id || `${item.name}-${idx}`}
                          className={`p-4 sm:px-6 flex items-center justify-between transition-colors ${
                            isDone ? "bg-zinc-50/60 dark:bg-zinc-950/40" : "hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30"
                          }`}
                        >
                          <div className="flex items-center gap-4 min-w-0 pr-4">
                            {/* Purchased Checkbox */}
                            <input
                              type="checkbox"
                              checked={item.purchased}
                              onChange={(e) =>
                                handleToggleItem(itemId, {
                                  purchased: e.target.checked,
                                })
                              }
                              className="h-5 w-5 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                            />

                            <div className="min-w-0">
                              <span
                                className={`text-sm font-semibold block truncate ${
                                  isDone
                                    ? "line-through text-zinc-400 dark:text-zinc-500"
                                    : "text-zinc-900 dark:text-white"
                                }`}
                              >
                                {item.name}
                              </span>
                              {item.inPantry && (
                                <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-900 mt-1">
                                  Already in Pantry
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 flex-shrink-0">
                            {/* Per-item Estimated Cost */}
                            {item.estimatedCost !== undefined && item.estimatedCost > 0 && (
                              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-900">
                                ~₹{item.estimatedCost}
                              </span>
                            )}

                            {/* Quantity & Unit */}
                            <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-xl">
                              {item.quantity} {item.unit}
                            </span>

                            {/* In Pantry Toggle Button */}
                            <button
                              onClick={() =>
                                handleToggleItem(itemId, {
                                  inPantry: !item.inPantry,
                                })
                              }
                              className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                                item.inPantry
                                  ? "bg-teal-600 text-white border-teal-600"
                                  : "bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-teal-400"
                              }`}
                            >
                              {item.inPantry ? "In Pantry ✓" : "Mark Pantry"}
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
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
