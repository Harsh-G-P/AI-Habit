import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectToDB from "@/lib/mongodb";
import User from "@/models/user";

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json()
        const isValidEmail = (email: string) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email)
        }
        if (!name || !email || !password) {
            return NextResponse.json({ message: "Missing fields" }, { status: 400 })
        }
        if (!isValidEmail(email)) {
            return NextResponse.json({ message: 'Invalid email format' }, { status: 400 })
        }
        if (password.length < 6) {
            return NextResponse.json({ message: "Password must be at least 6 character long" }, { status: 400 })
        }

        await connectToDB()

        const existing = await User.findOne({ email })
        if (existing) {
            return NextResponse.json({ message: "Email already in use" }, { status: 409 })
        }
        const hash = await bcrypt.hash(password, 10)
        const newUser = new User ({
            name,
            email,
            password:hash
        })
        await newUser.save()
        return NextResponse.json({message:"User created"},{status:201})
    } catch (e: any) {
        return NextResponse.json({ message: e.message || "Server error" }, { status: 500 })
    }
}