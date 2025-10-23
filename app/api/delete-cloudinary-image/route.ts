import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const { publicId } = await request.json();

    if (!publicId) {
      return NextResponse.json(
        { success: false, message: "Missing publicId" },
        { status: 400 }
      );
    }

    // Validate Cloudinary configuration
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error("Cloudinary configuration is missing");
      return NextResponse.json(
        { success: false, message: "Cloudinary configuration error" },
        { status: 500 }
      );
    }

    // Delete image using Cloudinary's destroy API
    const result = await cloudinary.uploader.destroy(publicId);

    console.log(`Cloudinary deletion result for ${publicId}:`, result);

    if (result.result === 'ok' || result.result === 'not found') {
      return NextResponse.json({
        success: true,
        message: "Image deleted successfully",
        result,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: "Image deletion failed",
        result,
      }, { status: 400 });
    }
  } catch (error) {
    console.error("Cloudinary deletion error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Deletion failed", 
        error: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}
