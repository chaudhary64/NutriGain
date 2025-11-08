import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h1 className="text-7xl font-bold text-gray-900 mb-6">
            NutriGain
          </h1>
          <p className="text-3xl text-gray-700 mb-6 font-semibold">
            Track your macros, achieve your goals
          </p>
          <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
            Monitor your daily calorie intake, protein, carbs, and fats with ease.
            Select meals from our database and watch your macros update in real-time.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/register"
              className="bg-linear-to-r from-blue-600 to-indigo-600 text-white px-10 py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition shadow-xl transform hover:scale-105 cursor-pointer"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="bg-white text-blue-600 px-10 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition shadow-xl border-2 border-blue-600 transform hover:scale-105 cursor-pointer"
            >
              Login
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition transform hover:scale-105">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Track Macros</h3>
              <p className="text-gray-600">
                Monitor calories, protein, carbs, and fats throughout your day with beautiful progress bars
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition transform hover:scale-105">
              <div className="text-5xl mb-4">🍽️</div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Meal Database</h3>
              <p className="text-gray-600">
                Select from a comprehensive database of meals with accurate nutrition data
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition transform hover:scale-105">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Real-time Updates</h3>
              <p className="text-gray-600">
                See your macro meters update instantly as you add or adjust meals
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
