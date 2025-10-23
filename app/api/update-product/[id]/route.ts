import { createServerClient } from "@/utils/supabase/server";
import { NextRequest } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { revalidatePath } from "next/cache";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = createServerClient();
    
    try {
        const { id } = await params;
        const body = await request.json();
        const { 
            title, 
            description, 
            price, 
            colors, 
            imageURLs, 
            imagePublicIds,
            oldImagePublicIds // IDs of images to be removed
        } = body;

        // Validate required fields
        if (!title || !description || !price || !colors || !imageURLs) {
            return Response.json(
                { error: 'Missing required fields: title, description, price, colors, imageURLs' }, 
                { status: 400 }
            );
        }

        // Validate data types
        if (!Array.isArray(colors) || !Array.isArray(imageURLs)) {
            return Response.json(
                { error: 'Colors and imageURLs must be arrays' }, 
                { status: 400 }
            );
        }

        // Delete old images from Cloudinary if specified
        if (oldImagePublicIds && Array.isArray(oldImagePublicIds) && oldImagePublicIds.length > 0) {
            console.log(`Attempting to delete ${oldImagePublicIds.length} old images from Cloudinary`);
            
            // Validate Cloudinary configuration
            if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
                console.error('Cloudinary configuration is missing. Old images will not be deleted from Cloudinary.');
                console.error('Required environment variables: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
            } else {
                try {
                    const deletePromises = oldImagePublicIds.map(async (publicId: string) => {
                        try {
                            const result = await cloudinary.uploader.destroy(publicId);
                            console.log(`Delete result for ${publicId}:`, result);
                            return { publicId, result, success: true };
                        } catch (error) {
                            console.error(`Failed to delete ${publicId}:`, error);
                            return { publicId, error, success: false };
                        }
                    });
                    
                    const deleteResults = await Promise.all(deletePromises);
                    
                    // Log summary
                    const successful = deleteResults.filter(r => r.success && (r.result?.result === 'ok' || r.result?.result === 'not found'));
                    const failed = deleteResults.filter(r => !r.success || (r.result?.result !== 'ok' && r.result?.result !== 'not found'));
                    
                    console.log(`Old images deletion summary: ${successful.length} successful, ${failed.length} failed`);
                    
                    if (failed.length > 0) {
                        console.warn('Failed to delete some old images from Cloudinary:', failed);
                    }
                } catch (cloudinaryError) {
                    console.error('Error deleting old images from Cloudinary:', cloudinaryError);
                    // Continue with update even if deletion fails
                }
            }
        }

        // Update product in Supabase
        const { data, error } = await supabase
            .from('Products')
            .update({
                Title: title,
                Description: description,
                Price: price,
                Colors: colors,
                ImageURLs: imageURLs,
                ImagePublicIds: imagePublicIds || []
            })
            .eq('id', id)
            .select();

        if (error) {
            console.error('Supabase error:', error);
            return Response.json(
                { error: 'Failed to update product in database', details: error.message }, 
                { status: 500 }
            );
        }

        if (!data || data.length === 0) {
            return Response.json(
                { error: 'Product not found' }, 
                { status: 404 }
            );
        }

        // Revalidate paths to update the cache
        revalidatePath('/catalog', 'page');
        revalidatePath('/admin', 'page');
        revalidatePath('/', 'page');
        revalidatePath('/api/get-products', 'page');

        return Response.json(
            { 
                message: 'Product updated successfully', 
                product: data[0] 
            }, 
            { 
                status: 200,
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                }
            }
        );

    } catch (error) {
        console.error("Update error:", error);
        return Response.json(
            { error: 'Internal server error' }, 
            { status: 500 }
        );
    }
}
