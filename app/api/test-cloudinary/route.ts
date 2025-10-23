import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Test endpoint to verify Cloudinary configuration
export async function GET(request: NextRequest) {
    try {
        // Check environment variables
        const envCheck = {
            CLOUDINARY_CLOUD_NAME: !!process.env.CLOUDINARY_CLOUD_NAME,
            CLOUDINARY_API_KEY: !!process.env.CLOUDINARY_API_KEY,
            CLOUDINARY_API_SECRET: !!process.env.CLOUDINARY_API_SECRET,
        };

        console.log('[TEST] Environment variables check:', envCheck);

        if (!envCheck.CLOUDINARY_CLOUD_NAME || !envCheck.CLOUDINARY_API_KEY || !envCheck.CLOUDINARY_API_SECRET) {
            return NextResponse.json({
                success: false,
                message: "Cloudinary environment variables are missing",
                envCheck,
                hint: "Make sure you have created a .env.local file with CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET"
            }, { status: 500 });
        }

        // Configure Cloudinary
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });

        // Test Cloudinary connection by fetching resources
        const result = await cloudinary.api.ping();

        return NextResponse.json({
            success: true,
            message: "Cloudinary is configured correctly",
            envCheck,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            pingResult: result,
        });

    } catch (error) {
        console.error('[TEST] Cloudinary test error:', error);
        return NextResponse.json({
            success: false,
            message: "Cloudinary test failed",
            error: error instanceof Error ? error.message : "Unknown error",
            hint: "Check your Cloudinary credentials in .env.local file"
        }, { status: 500 });
    }
}
