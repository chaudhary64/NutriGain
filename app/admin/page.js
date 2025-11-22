"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

// Helper function to convert text to title case
const toTitleCase = (str) => {
  if (!str) return "";
  return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function AdminPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    servingSize: "1 serving",
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
    category: "general",
  });

  useEffect(() => {
    if (!authLoading && (!user || !user.isAdmin)) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && user.isAdmin) {
      fetchMeals();
    }
  }, [user]);

  const fetchMeals = async () => {
    try {
      const res = await fetch("/api/meals");
      const data = await res.json();
      // Sort meals alphabetically by name
      const sortedMeals = data.meals.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      setMeals(sortedMeals);
    } catch (error) {
      console.error("Error fetching meals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      servingSize: formData.servingSize,
      macros: {
        calories: parseFloat(formData.calories) || 0,
        protein: parseFloat(formData.protein) || 0,
        carbs: parseFloat(formData.carbs) || 0,
        fats: parseFloat(formData.fats) || 0,
      },
      category: formData.category,
    };

    try {
      const url = editingMeal ? `/api/meals/${editingMeal._id}` : "/api/meals";
      const method = editingMeal ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        fetchMeals();
        resetForm();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save meal");
      }
    } catch (error) {
      console.error("Error saving meal:", error);
      alert("Failed to save meal");
    }
  };

  const handleEdit = (meal) => {
    setEditingMeal(meal);
    setFormData({
      name: meal.name,
      servingSize: meal.servingSize,
      calories: meal.macros.calories,
      protein: meal.macros.protein,
      carbs: meal.macros.carbs,
      fats: meal.macros.fats,
      category: meal.category,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this meal?")) return;

    try {
      const res = await fetch(`/api/meals/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchMeals();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete meal");
      }
    } catch (error) {
      console.error("Error deleting meal:", error);
      alert("Failed to delete meal");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      servingSize: "1 serving",
      calories: "",
      protein: "",
      carbs: "",
      fats: "",
      category: "general",
    });
    setEditingMeal(null);
    setShowForm(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center py-3 sm:py-0 sm:h-16 gap-3 sm:gap-4">
            {/* Top row on mobile: Title and Logout */}
            <div className="flex items-center justify-between w-full sm:w-auto">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                Admin Dashboard
              </h1>

              {/* Logout button - visible on mobile, hidden on desktop */}
              <button
                onClick={logout}
                className="sm:hidden bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition cursor-pointer text-sm"
              >
                Logout
              </button>
            </div>

            {/* Desktop controls */}
            <div className="hidden sm:flex items-center gap-3">
              {/* Welcome message - shown on tablet+ */}
              <span className="text-gray-800 text-sm whitespace-nowrap">
                Welcome, {user.name}
              </span>

              {/* Logout button - visible on desktop */}
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition cursor-pointer text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {!showForm && (
          <div className="mb-4 sm:mb-6">
            <button
              onClick={() => setShowForm(!showForm)}
              className="w-full sm:w-auto bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer text-sm sm:text-base"
            >
              + Add New Meal
            </button>
          </div>
        )}

        {showForm && (
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-800">
              {editingMeal ? "Edit Meal" : "Add New Meal"}
            </h2>
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-gray-700 font-medium text-sm sm:text-base">
                    Meal Name *
                  </label>
                  <p className="text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    ℹ️ Auto-capitalized
                  </p>
                </div>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm sm:text-base"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
                  Serving Size
                </label>
                <input
                  type="text"
                  placeholder="e.g., 1, 250gm, 2 cups"
                  value={formData.servingSize}
                  onChange={(e) =>
                    setFormData({ ...formData, servingSize: e.target.value })
                  }
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
                  Calories *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.calories}
                  onChange={(e) =>
                    setFormData({ ...formData, calories: e.target.value })
                  }
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm sm:text-base"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
                  Protein (g) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.protein}
                  onChange={(e) =>
                    setFormData({ ...formData, protein: e.target.value })
                  }
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm sm:text-base"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
                  Carbs (g) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.carbs}
                  onChange={(e) =>
                    setFormData({ ...formData, carbs: e.target.value })
                  }
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm sm:text-base"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
                  Fats (g) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.fats}
                  onChange={(e) =>
                    setFormData({ ...formData, fats: e.target.value })
                  }
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm sm:text-base"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white cursor-pointer text-sm sm:text-base"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="general">General</option>
                </select>
              </div>

              <div className="sm:col-span-2 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-green-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-green-700 transition cursor-pointer text-sm sm:text-base"
                >
                  {editingMeal ? "Update Meal" : "Add Meal"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full sm:w-auto bg-gray-400 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-gray-500 transition cursor-pointer text-sm sm:text-base"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider hidden sm:table-cell">
                  Serving Size
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Calories
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider hidden md:table-cell">
                  Protein
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider hidden md:table-cell">
                  Carbs
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider hidden md:table-cell">
                  Fats
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider hidden lg:table-cell">
                  Category
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {meals.map((meal) => (
                <tr key={meal._id}>
                  <td className="px-3 sm:px-6 py-4">
                    <div className="font-medium text-gray-900 text-sm sm:text-base">
                      {toTitleCase(meal.name)}
                    </div>
                    {meal.description && (
                      <div className="text-xs sm:text-sm text-gray-500">
                        {meal.description}
                      </div>
                    )}
                    <div className="sm:hidden text-xs text-gray-600 mt-1">
                      {meal.servingSize}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-800 hidden sm:table-cell">
                    {meal.servingSize}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                    {meal.macros.calories}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden md:table-cell">
                    {meal.macros.protein}g
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden md:table-cell">
                    {meal.macros.carbs}g
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden md:table-cell">
                    {meal.macros.fats}g
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {meal.category}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                    <button
                      onClick={() => handleEdit(meal)}
                      className="text-indigo-600 hover:text-indigo-900 mr-2 sm:mr-4 cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(meal._id)}
                      className="text-red-600 hover:text-red-900 cursor-pointer"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
