import { createServerClient } from "@/utils/supabase/server";
import { NextRequest } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to extract public_id from Cloudinary URL
function extractPublicId(url: string): string | null {
  try {
    const parts = url.split('/');
    const fileWithExtension = parts[parts.length - 1];
    const folderIndex = parts.indexOf('crochet-products');
    
    if (folderIndex !== -1) {
      const pathParts = parts.slice(folderIndex);
      const fileName = fileWithExtension.split('.')[0];
      return pathParts.slice(0, -1).concat(fileName).join('/');
    }
    
    return fileWithExtension.split('.')[0];
  } catch (error) {
    console.error('Error extracting public_id:', error);
    return null;
  }
}

// Helper function to delete images from Cloudinary
async function deleteCloudinaryImages(imageUrls: string[]): Promise<void> {
  const deletePromises = imageUrls.map(async (url) => {
    const publicId = extractPublicId(url);
    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId);
        console.log(`Deleted image: ${publicId}`);
      } catch (error) {
        console.error(`Failed to delete image ${publicId}:`, error);
      }
    }
  });

  await Promise.all(deletePromises);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServerClient();
  const { id } = await params;

  try {
    // First, get the product to retrieve image URLs
    const { data: product, error: fetchError } = await supabase
      .from("Products")
      .select("ImageURLs")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Supabase fetch error:", fetchError);
      return Response.json(
        { error: "Failed to fetch product", details: fetchError.message },
        { status: 500 }
      );
    }

    if (!product) {
      return Response.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Delete images from Cloudinary
    if (product.ImageURLs && Array.isArray(product.ImageURLs)) {
      await deleteCloudinaryImages(product.ImageURLs);
    }

    // Delete product from database
    const { error: deleteError } = await supabase
      .from("Products")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Supabase delete error:", deleteError);
      return Response.json(
        { error: "Failed to delete product", details: deleteError.message },
        { status: 500 }
      );
    }

    return Response.json(
      { message: "Product and associated images deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting product:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
