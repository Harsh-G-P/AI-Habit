import connectToDB from "@/lib/mongodb";
import Habit from "@/models/habit";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export interface Insights {
  triggers: string[];
  streaks: string[];
  suggestions: string[];
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    await connectToDB();
    const logs = await Habit.find({ userId })
      .sort({ createdAt: -1 })
      .limit(30);

    if (!logs || logs.length === 0) {
      return NextResponse.json({
        triggers: [],
        streaks: [],
        suggestions: ["No habit data yet. Log some habits first!"],
      });
    }

    // -------- Simple local insights logic --------
    const triggersMap: Record<string, number> = {};
    const streaksMap: Record<string, number> = {};

    let lastHabit: string | null = null;
    let streakCount = 0;

    for (const log of logs) {
      // Count triggers (emotion + environment)
      const key = `${log.emotion} in ${log.environment}`;
      triggersMap[key] = (triggersMap[key] || 0) + 1;

      // Count streaks
      if (log.habit === lastHabit) {
        streakCount++;
      } else {
        streakCount = 1;
        lastHabit = log.habit;
      }
      streaksMap[log.habit] = Math.max(streaksMap[log.habit] || 0, streakCount);
    }

    const insights: Insights = {
      triggers: Object.entries(triggersMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([k]) => k),
      streaks: Object.entries(streaksMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([habit, count]) => `${habit}: ${count} day(s)`),
      suggestions: ["Keep logging your habits consistently!", "Try to maintain streaks!"],
    };

    return NextResponse.json(insights);
  } catch (err) {
    console.error("AI Insights API Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
