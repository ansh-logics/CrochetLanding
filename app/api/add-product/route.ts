import { createServerClient } from "@/utils/supabase/server";
import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
    const supabase = createServerClient();
    
    try {
        const body = await request.json();
        const { title, description, price, colors, imageURLs, imagePublicIds } = body;

        console.log('[ADD-PRODUCT] Received data:', {
            title,
            colorsCount: colors?.length,
            imageURLsCount: imageURLs?.length,
            imagePublicIdsCount: imagePublicIds?.length
        });

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

        // Validate imagePublicIds
        if (!imagePublicIds || !Array.isArray(imagePublicIds) || imagePublicIds.length === 0) {
            console.warn('[ADD-PRODUCT] ⚠️ WARNING: No imagePublicIds provided! Images cannot be deleted later.');
        }

        if (imagePublicIds && imagePublicIds.length !== imageURLs.length) {
            console.warn('[ADD-PRODUCT] ⚠️ WARNING: imagePublicIds count does not match imageURLs count');
        }

        // Insert product into Supabase
        const { data, error } = await supabase
            .from('Products')
            .insert([
                {
                    Title: title,
                    Description: description,
                    Price: price,
                    Colors: colors,
                    ImageURLs: imageURLs,
                    ImagePublicIds: imagePublicIds || [] // Store Cloudinary public IDs
                }
            ])
            .select();

        if (error) {
            console.error('[ADD-PRODUCT] Supabase error:', error);
            return Response.json(
                { error: 'Failed to insert product into database', details: error.message }, 
                { status: 500 }
            );
        }

        console.log('[ADD-PRODUCT] ✅ Product created successfully:', {
            id: data[0].id,
            title: data[0].Title,
            imagePublicIds: data[0].ImagePublicIds
        });

        // Revalidate paths to update the cache
        revalidatePath('/catalog', 'page');
        revalidatePath('/admin', 'page');
        revalidatePath('/', 'page');
        revalidatePath('/api/get-products', 'page');

        return Response.json(
            { 
                message: 'Product created successfully', 
                product: data[0] 
            }, 
            { 
                status: 201,
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                }
            }
        );

    } catch (error) {
        console.error("[ADD-PRODUCT] Upload error:", error);
        return Response.json(
            { error: 'Internal server error' }, 
            { status: 500 }
        );
    }
}
