"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function HabitLogPage() {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;
  const router = useRouter();

  const [habit, setHabit] = useState("");
  const [time, setTime] = useState("");
  const [emotion, setEmotion] = useState("");
  const [environment, setEnvironment] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [habits, setHabits] = useState<any[]>([]);

  // Initialize datetime
  useEffect(() => {
    if (!time) {
      const now = new Date();
      const localISO = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setTime(localISO);
    }
  }, [time]);

  // Fetch habits for streak visualization
  useEffect(() => {
    const fetchHabits = async () => {
      if (!userId) return;
      try {
        const res = await fetch(`/api/habit?userId=${userId}`);
        const data = await res.json();
        if (data.success) setHabits(data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchHabits();
  }, [userId]);

  const calculateHabitStreak = (habitName: string) => {
    const filtered = habits
      .filter((h) => h.habit === habitName)
      .map((h) => new Date(h.time).toDateString());

    if (filtered.length === 0) return 0;

    const uniqueDates = Array.from(new Set(filtered))
      .map((d) => new Date(d))
      .sort((a, b) => b.getTime() - a.getTime());

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (let date of uniqueDates) {
      date.setHours(0, 0, 0, 0);
      if (date.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if ((currentDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24) === 1) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return setMessage("❌ You must be logged in.");

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/habit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, habit, time: new Date(time), emotion, environment }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("✅ Habit logged!");
        setHabit("");
        setEmotion("");
        setEnvironment("");
        setHabits([...habits, data.data]); // Update habits for streak
      } else setMessage("❌ " + (data.error || "Failed to log habit"));
    } catch (err) {
      setMessage("❌ Something went wrong");
    } finally {
      setLoading(false);
    }
  };

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
  const uniqueHabits = Array.from(new Set(habits.map((h) => h.habit)));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col items-center p-4 md:p-6"
    >
      {/* Progress Circles */}
      <motion.h2
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-2xl font-bold text-gray-800 mb-6"
      >
        Your Habit Streaks
      </motion.h2>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
        className="flex flex-wrap gap-6 justify-center mb-10"
      >
        {uniqueHabits.map((h, i) => (
          <motion.div
            key={h}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            whileHover={{ scale: 1.05 }}
            className="flex flex-col items-center w-24 sm:w-28 md:w-32"
          >
            <CircularProgressbar
              value={calculateHabitStreak(h)}
              maxValue={7}
              text={`${calculateHabitStreak(h)}`}
              styles={buildStyles({
                pathColor: "#10b981",
                textColor: "#065f46",
                trailColor: "#d1fae5",
                textSize: "20px",
              })}
            />
            <p className="text-center mt-2 text-sm text-gray-700 font-medium truncate w-full">
              {h}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Form */}
      <motion.h1
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-3xl font-bold mb-6 text-green-600"
      >
        Log a Habit
      </motion.h1>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        onSubmit={handleSubmit}
        className="space-y-6 w-full max-w-lg sm:max-w-xl bg-white p-8 rounded-2xl shadow-lg"
      >
        {/** Habit Input */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
        >
          <label className="block mb-2 font-semibold text-gray-700">Habit</label>
          <input
            type="text"
            placeholder="e.g. Drinking Water"
            value={habit}
            onChange={(e) => setHabit(e.target.value)}
            className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-green-400 focus:outline-none transition shadow-sm hover:shadow-md"
            required
          />
        </motion.div>

        {/** Date Input */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <label className="block mb-2 font-semibold text-gray-700">Date</label>
          <input
            type="date"
            value={time ? time.split("T")[0] : ""}
            onChange={(e) => {
              const current = time ? time.split("T")[1] || "00:00" : "00:00";
              setTime(`${e.target.value}T${current}`);
            }}
            onClick={(e) => (e.currentTarget as HTMLInputElement).showPicker()}
            className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-green-400 focus:outline-none transition shadow-sm hover:shadow-md"
            required
          />
        </motion.div>

        {/** Time Input */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
        >
          <label className="block mb-2 font-semibold text-gray-700">Time</label>
          <input
            type="time"
            value={time ? time.split("T")[1] : ""}
            onChange={(e) => {
              const current = time ? time.split("T")[0] : "";
              setTime(`${current}T${e.target.value}`);
            }}
            onClick={(e) => (e.currentTarget as HTMLInputElement).showPicker()}
            className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-green-400 focus:outline-none transition shadow-sm hover:shadow-md"
            required
          />
        </motion.div>

        {/** Emotion */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <label className="block mb-2 font-semibold text-gray-700">Emotion</label>
          <select
            className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-green-400 focus:outline-none transition shadow-sm hover:shadow-md"
            value={emotion}
            onChange={(e) => setEmotion(e.target.value)}
            required
          >
            <option value="">Select Emotion</option>
            <option value="happy">😊 Happy</option>
            <option value="stressed">😰 Stressed</option>
            <option value="tired">😴 Tired</option>
            <option value="motivated">💪 Motivated</option>
            <option value="neutral">😐 Neutral</option>
          </select>
        </motion.div>

        {/** Environment */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.45 }}
        >
          <label className="block mb-2 font-semibold text-gray-700">Environment</label>
          <select
            className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-green-400 focus:outline-none transition shadow-sm hover:shadow-md"
            value={environment}
            onChange={(e) => setEnvironment(e.target.value)}
            required
          >
            <option value="">Select Environment</option>
            <option value="home">🏠 Home</option>
            <option value="work">💻 Work</option>
            <option value="outside">🌳 Outside</option>
            <option value="gym">🏋️ Gym</option>
            <option value="other">✨ Other</option>
          </select>
        </motion.div>

        {/** Submit Button */}
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition shadow-md hover:shadow-lg"
        >
          {loading ? "Saving..." : "Log Habit"}
        </motion.button>

        {message && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 text-center text-gray-700"
          >
            {message}
          </motion.p>
        )}
      </motion.form>
    </motion.div>
  );
}
