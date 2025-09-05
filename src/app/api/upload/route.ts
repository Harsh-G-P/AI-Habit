import { NextResponse } from "next/server";
import cloudinary from "cloudinary";

// Cloudinary config
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const { data } = await req.json(); // base64 string
    if (!data) {
      return NextResponse.json({ success: false, message: "No image provided" }, { status: 400 });
    }

    const uploadResponse = await cloudinary.v2.uploader.upload(data, {
      folder: "profile_avatars",
    });

    return NextResponse.json({
      success: true,
      url: uploadResponse.secure_url,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
