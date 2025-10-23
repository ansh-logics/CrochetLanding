import { createServerClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { revalidatePath } from "next/cache";

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = createServerClient();

    try {
        // Await params before accessing properties
        const { id: productId } = await params;

        // First, fetch the product to get ImagePublicIds
        const { data: product, error: fetchError } = await supabase
            .from('Products')
            .select('ImagePublicIds')
            .eq('id', productId)
            .single();

        if (fetchError) {
            return NextResponse.json(
                { error: 'Product not found', details: fetchError.message },
                { status: 404 }
            );
        }

        // Parse ImagePublicIds if it's a string
        let imagePublicIds = product.ImagePublicIds;
        
        if (typeof imagePublicIds === 'string') {
            try {
                imagePublicIds = JSON.parse(imagePublicIds);
            } catch (parseError) {
                imagePublicIds = [];
            }
        }

        // Check if ImagePublicIds exists and is a non-empty array
        if (imagePublicIds && Array.isArray(imagePublicIds) && imagePublicIds.length > 0) {
            // Delete each image from Cloudinary
            const deletionErrors = [];

            for (const publicId of imagePublicIds) {
                try {
                    const result = await cloudinary.uploader.destroy(publicId);
                    
                    // Check if deletion was successful
                    if (result.result !== 'ok' && result.result !== 'not found') {
                        deletionErrors.push({ publicId, result });
                    }
                } catch (cloudinaryError: any) {
                    deletionErrors.push({ publicId, error: cloudinaryError.message });
                }
            }

            // If there were any deletion errors, halt the process
            if (deletionErrors.length > 0) {
                return NextResponse.json(
                    {
                        error: 'Failed to delete images from Cloudinary',
                        failedImages: deletionErrors,
                        message: 'Product not deleted to maintain data integrity'
                    },
                    { status: 500 }
                );
            }
        }

        // Only delete from database if Cloudinary deletion succeeded (or there were no images)
        const { error: deleteError } = await supabase
            .from('Products')
            .delete()
            .eq('id', productId);

        if (deleteError) {
            return NextResponse.json(
                { error: 'Failed to delete product from database', details: deleteError.message },
                { status: 500 }
            );
        }

        // Revalidate paths to update the cache
        revalidatePath('/catalog', 'page');
        revalidatePath('/admin', 'page');
        revalidatePath('/', 'page');
        revalidatePath('/api/get-products', 'page');

        return NextResponse.json(
            {
                message: 'Product and associated images deleted successfully',
                productId
            },
            { 
                status: 200,
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                }
            }
        );

    } catch (error: any) {
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}
