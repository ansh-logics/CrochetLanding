import { NextRequest } from "next/server";
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

export async function POST(request: NextRequest){
    try{
        const data = await request.formData();
        const files = data.getAll('files') as File[];

        if (!files || files.length === 0){
            return Response.json({
                error: "No files uploaded"
            },
        {
            status:400
        });
        }
        const uploadPromises = files.map(async(file) =>{
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            return new Promise ((resolve, reject)=>{
                cloudinary.uploader.upload_stream(
                    {
                        resource_type: 'image',
                        folder: 'crochet-products',
                        transformation:[
                            {width:800, height: 900, crop:'limit'},
                            {quality: 'auto:good'}
                        ]
                    },
                    (error, result)=>{
                        if (error){
                            reject(error);
                        }
                        else{
                            resolve(result?.secure_url);
                        }
                    }
                ).end(buffer);
            });
        });
        const urls = await Promise.all(uploadPromises);
        return Response.json({urls});
    }catch(error){
        console.error("upload error:", error);
        return Response.json({error: 'Upload failed'}, {status: 500});
    }
}
