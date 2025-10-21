import { createServerClient } from "@/utils/supabase/server";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    const supabase = createServerClient();
    
    try {
        const body = await request.json();
        const { title, description, price, colors, imageURLs } = body;

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

        // Insert product into Supabase
        const { data, error } = await supabase
            .from('Products')
            .insert([
                {
                    Title: title,
                    Description: description,
                    Price: price,
                    Colors: colors,
                    ImageURLs: imageURLs
                }
            ])
            .select();

        if (error) {
            console.error('Supabase error:', error);
            return Response.json(
                { error: 'Failed to insert product into database', details: error.message }, 
                { status: 500 }
            );
        }

        return Response.json(
            { 
                message: 'Product created successfully', 
                product: data[0] 
            }, 
            { status: 201 }
        );

    } catch (error) {
        console.error("Upload error:", error);
        return Response.json(
            { error: 'Internal server error' }, 
            { status: 500 }
        );
    }
}
