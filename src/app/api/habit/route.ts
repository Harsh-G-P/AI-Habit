import connectToDB from "@/lib/mongodb";
import Habit from "@/models/habit";
import { NextResponse } from "next/server";


export async function POST(req: Request) {
    try {
        await connectToDB()
        const body = await req.json()
        const { userId, habit, time, emotion, environment } = body

        if (!userId || !habit) {
            return NextResponse.json({ error: 'Missing field' }, { status: 400 })
        }

        const newHabit = await Habit.create({
            userId,
            habit,
            time,
            emotion,
            environment,
        })

        return NextResponse.json({ success: true, data: newHabit })

    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}


export async function GET(req: Request) {
    try {
        await connectToDB()
        const { searchParams } = new URL(req.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json({ error: "UserId required" }, { status: 400 });
        }

        const habits = await Habit.find({ userId }).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: habits });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}