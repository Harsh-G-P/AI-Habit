"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner"; // ✅ toast notifications

interface Habit {
  _id: string;
  userId: string;
  habit: string;
  time: string;
  emotion: string;
  environment: string;
  createdAt: string;
}

export default function Dashboard() {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;

  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);

  // ✅ Fetch habits
  useEffect(() => {
    const fetchHabits = async () => {
      if (!userId) return;
      try {
        const res = await fetch(`/api/habit?userId=${userId}`);
        const data = await res.json();
        if (data.success) {
          setHabits(data.data);
          toast.success("Habits updated! 🎉", { duration: 2000 });
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load habits ❌");
      } finally {
        setLoading(false);
      }
    };
    fetchHabits();
  }, [userId]);

  // ✅ Daily Reminder (Notification API)
  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission();
    }

    const reminder = setTimeout(() => {
      if (Notification.permission === "granted") {
        new Notification("🌱 Don’t forget to log your habits today!");
      }
    }, 1000 * 60 * 5); // 5 minutes after visiting dashboard

    return () => clearTimeout(reminder);
  }, []);

  // ✅ Weekly data for chart
  const weeklyData = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
    (day) => ({
      day,
      habits: habits.filter(
        (h) =>
          new Date(h.time).toLocaleDateString("en-US", { weekday: "short" }) ===
          day
      ).length,
    })
  );

  // ✅ Calculate streak
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
      } else if (
        (currentDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24) === 1
      ) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-b from-green-50 to-white p-4 md:p-8"
    >
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-3 sm:gap-0"
      >
        <h1 className="text-3xl font-bold text-gray-800">📊 Habit Dashboard</h1>
        {session ? (
          <Link href="/profile">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-green-500 hover:bg-green-400 text-white px-5 py-2 rounded-lg font-medium transition w-full sm:w-auto"
            >
              Profile
            </motion.button>
          </Link>
        ) : (
          <Link href="/log">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-green-500 hover:bg-green-400 text-white px-5 py-2 rounded-lg font-medium transition w-full sm:w-auto"
            >
              Login
            </motion.button>
          </Link>
        )}
      </motion.header>

      {/* Overview Cards */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.1 } },
        }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8"
      >
        {[
          {
            title: "Habits Logged Today",
            value: habits.filter(
              (h) =>
                new Date(h.time).toDateString() === new Date().toDateString()
            ).length,
          },
          {
            title: "Current Streak",
            value:
              habits.length === 0
                ? "No streak yet"
                : `${Array.from(new Set(habits.map((h) => h.habit))).filter(
                    (habitName) => calculateHabitStreak(habitName) > 0
                  ).length} active streak(s)`,
          },
          {
            title: "AI Insights",
            value: (
              <ul className="text-green-700 text-sm mt-2 list-disc pl-5 space-y-1">
                <li>Track your consistency daily</li>
                <li>Evenings are popular logging times</li>
                <li>Check mood vs. habits</li>
              </ul>
            ),
          },
        ].map((card, i) => (
          <motion.div
            key={i}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            whileHover={{ scale: 1.03 }}
            className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition"
          >
            <p className="text-sm text-gray-500">{card.title}</p>
            <motion.h2
              key={card.title + card.value}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-3xl font-bold mt-2 text-green-600"
            >
              {card.value}
            </motion.h2>
          </motion.div>
        ))}
      </motion.section>

      {/* Weekly Chart */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition mb-8"
      >
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Weekly Habit Overview
        </h2>
        <div className="w-full h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#10b981" />
              <YAxis stroke="#10b981" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#f0fdf4",
                  border: "none",
                  color: "#065f46",
                  borderRadius: "8px",
                  padding: "8px",
                }}
              />
              <Bar dataKey="habits" fill="#34d399" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.section>

      {/* Recent Habits */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          Recent Habits
        </h2>
        {loading ? (
          <p className="text-gray-500">Loading habits...</p>
        ) : habits.length === 0 ? (
          <p className="text-gray-500">No habits logged yet.</p>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1 } },
            }}
            className="space-y-4"
          >
            {habits
              .sort(
                (a, b) =>
                  new Date(b.time).getTime() - new Date(a.time).getTime()
              )
              .slice(0, 5)
              .map((habit) => (
                <motion.div
                  key={habit._id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center shadow hover:shadow-lg transition"
                >
                  <div className="mb-2 sm:mb-0">
                    <h3 className="font-semibold text-gray-800 text-lg">
                      {habit.habit}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(habit.time).toLocaleString()} • {habit.emotion}{" "}
                      • {habit.environment}
                    </p>
                    <motion.p
                      key={habit._id + "-streak"}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="text-sm text-green-600 mt-1"
                    >
                      Streak: {calculateHabitStreak(habit.habit)} days
                    </motion.p>
                  </div>
                  <button
                    className="text-sm text-green-500 hover:underline self-end sm:self-auto"
                    onClick={() => {
                      setSelectedHabit(habit);
                      toast.info(`Viewing ${habit.habit}`);
                    }}
                  >
                    View
                  </button>
                </motion.div>
              ))}
          </motion.div>
        )}
      </motion.section>

      {/* Habit Modal */}
      {selectedHabit && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto relative"
          >
            <button
              onClick={() => setSelectedHabit(null)}
              className="absolute top-3 right-3 text-gray-700 hover:text-red-500 font-bold text-lg transition"
            >
              ✖
            </button>
            <h3 className="text-xl font-bold mb-4 text-gray-800">
              {selectedHabit.habit}
            </h3>
            <p className="mb-2">
              <strong>Time:</strong>{" "}
              {new Date(selectedHabit.time).toLocaleString()}
            </p>
            <p className="mb-2">
              <strong>Emotion:</strong> {selectedHabit.emotion}
            </p>
            <p className="mb-2">
              <strong>Environment:</strong> {selectedHabit.environment}
            </p>
            <p className="mb-2">
              <strong>Streak:</strong>{" "}
              {calculateHabitStreak(selectedHabit.habit)} days
            </p>
            <p className="text-sm text-gray-500 mt-3">
              Created At: {new Date(selectedHabit.createdAt).toLocaleString()}
            </p>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
