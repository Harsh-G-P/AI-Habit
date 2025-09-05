"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Insights {
  triggers: string[];
  streaks: string[];
  suggestions: string[];
}

export default function AIInsightsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [insights, setInsights] = useState<Insights>({
    triggers: [],
    streaks: [],
    suggestions: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔹 Fetch insights
  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai-insights");
      if (!res.ok) throw new Error("API Error");
      const data = await res.json();

      setInsights({
        triggers: data.triggers || ["No triggers available"],
        streaks: data.streaks || ["No streaks available"],
        suggestions: data.suggestions || ["No suggestions available"],
      });
    } catch (err: any) {
      console.error(err);
      setError("Failed to fetch AI insights.");
      setInsights({
        triggers: ["No data available"],
        streaks: ["No streaks available"],
        suggestions: ["Log some habits to get AI insights!"],
      });
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Animation variants
  const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.15 } } };
  const cardVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

  // 🔹 Loading / Auth check
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading session...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
        <h1 className="text-2xl font-bold mb-4">🚫 Access Denied</h1>
        <p className="mb-6">You must be logged in to view this page.</p>
        <motion.button
          onClick={() => router.push("/log")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition"
        >
          Go to Login
        </motion.button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col items-center p-6"
    >
      {/* Page Header */}
      <motion.h1
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-semibold text-black mb-6 drop-shadow-md text-center"
      >
        🦾 AI Insights
      </motion.h1>

      {/* Refresh Button */}
      <motion.button
        onClick={fetchInsights}
        disabled={loading}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl font-semibold mb-8 shadow-md hover:shadow-lg transition disabled:opacity-50"
      >
        {loading ? "Analyzing..." : "Refresh Insights"}
      </motion.button>

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-500 mb-6"
        >
          {error}
        </motion.p>
      )}

      {/* Cards Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid md:grid-cols-3 gap-6 w-full max-w-5xl"
      >
        {[
          { title: "🔑 Triggers", items: insights.triggers },
          { title: "📈 Streaks", items: insights.streaks },
          { title: "💡 Suggestions", items: insights.suggestions },
        ].map((card, i) => (
          <motion.div
            key={i}
            variants={cardVariants}
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition flex flex-col justify-between h-full"
          >
            <h2 className="text-xl font-semibold mb-4 text-green-600">{card.title}</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-700 flex-1">
              {card.items.map((item, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="hover:text-green-600 transition-colors"
                >
                  {item}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        ))}
      </motion.div>

      {/* Decorative Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-12 w-full max-w-5xl h-24 bg-gradient-to-r from-green-100 via-white to-green-100 rounded-3xl shadow-inner"
      />
    </motion.div>
  );
}
