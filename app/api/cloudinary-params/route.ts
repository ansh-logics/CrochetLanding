import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface PostRequestBody {
    paramsToSign: Record<string, string>;
}

interface SignatureResponse {
    signature: string;
}

export async function POST(request: Request): Promise<Response> {
    const body: PostRequestBody = await request.json();
    const { paramsToSign } = body;
    const apiSecret: string | undefined = process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET;
    if (!apiSecret) {
        throw new Error("Cloudinary API secret is not defined in environment variables.");
    }
    const signature: string = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);
    const responseBody: SignatureResponse = { signature };
    return Response.json(responseBody);
}
