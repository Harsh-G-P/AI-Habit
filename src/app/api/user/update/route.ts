import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDB from "@/lib/mongodb";
import User from "@/models/user";


export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !session.user) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }
        await connectToDB()
        const body = await req.json()
        const { name, bio, image, email } = body
        
        const updateFields: any = {};
        if (name) updateFields.name = name;
        if (bio) updateFields.bio = bio;
        if (email) updateFields.email = email;
        if (image) updateFields.image = image;

        const updatedUser = await User.findByIdAndUpdate(
            (session.user as any).id,
            { $set: { name, image, bio, email } },
            { new: true }
        ).select("-password"); // don’t return password

        if (!updatedUser) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, user: updatedUser });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}


export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !session.user) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }
        await connectToDB()
        const user = await User.findById((session.user as any).id).select("-password")

        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }
        return NextResponse.json({ success: true, user });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}