"use client";

import { motion } from "framer-motion";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

// Product type definition
type Product = {
  id: number;
  name: string;
  description: string;
  longDescription: string;
  price: number;
  originalPrice?: number;
  category: string;
  images: string[];
  featured?: boolean;
  inStock: boolean;
  stockCount: number;
  customizable: boolean;
  materials: string[];
  dimensions: string;
  careInstructions: string[];
  colors: string[];
  sizes?: string[];
  features: string[];
  reviews: {
    rating: number;
    count: number;
  };
};

// Sample product data - In a real app, this would come from an API
const sampleProduct: Product = {
  id: 1,
  name: "Autumn Sunset Blanket",
  description: "A warm, luxurious blanket with earthy tones perfect for cozy evenings",
  longDescription: "Handcrafted with love and attention to detail, our Autumn Sunset Blanket captures the warm, golden hues of a perfect autumn evening. Made with premium organic cotton yarn, this blanket offers exceptional softness and durability. Each stitch tells a story of traditional craftsmanship passed down through generations. The intricate pattern features a blend of warm oranges, deep browns, and golden yellows that will complement any home decor while providing the ultimate in comfort and coziness.",
  price: 129,
  originalPrice: 159,
  category: "Cozy Blankets",
  images: [
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=800&fit=crop",
    "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&h=800&fit=crop",
    "https://images.unsplash.com/photo-1631889993959-41b4e9c6e3c5?w=800&h=800&fit=crop",
    "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=800&fit=crop",
  ],
  featured: true,
  inStock: true,
  stockCount: 8,
  customizable: true,
  materials: ["100% Organic Cotton", "Hypoallergenic Filling", "Natural Dyes"],
  dimensions: "60\" x 80\" (152cm x 203cm)",
  careInstructions: [
    "Machine wash cold on gentle cycle",
    "Tumble dry low heat",
    "Do not bleach",
    "Iron on low if needed"
  ],
  colors: ["Autumn Sunset", "Ocean Breeze", "Forest Green", "Rose Gold"],
  sizes: ["Throw (50\"x60\")", "Twin (60\"x80\")", "Queen (90\"x90\")", "King (108\"x90\")"],
  features: [
    "Handcrafted with premium yarns",
    "Machine washable for easy care",
    "Hypoallergenic and baby-safe",
    "Customizable colors available",
    "Free gift wrapping included"
  ],
  reviews: {
    rating: 4.8,
    count: 127
  }
};

export default function ProductViewPage() {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(sampleProduct.colors[0]);
  const [selectedSize, setSelectedSize] = useState(sampleProduct.sizes?.[1] || "");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "care" | "reviews">("description");

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= sampleProduct.stockCount) {
      setQuantity(newQuantity);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F0] to-[#F5E6D3] pt-24">
      {/* Breadcrumb Navigation */}
      {/* Breadcrumb Navigation */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto px-4 py-3 md:py-4"
      >
        <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-[#A0522D] overflow-x-auto">
          <Link href="/" className="hover:text-[#8B4513] transition-colors whitespace-nowrap">Home</Link>
          <ChevronRightIcon className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
          <Link href="/catalog" className="hover:text-[#8B4513] transition-colors whitespace-nowrap">Catalog</Link>
          <ChevronRightIcon className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
          <span className="text-[#8B4513] font-medium truncate">{sampleProduct.name}</span>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 pb-16 md:pb-20">
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 lg:gap-12">
          {/* Product Images */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            {/* Main Image */}
            <div className="relative bg-white/60 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg border border-white/20">
              <div className="aspect-square relative">
                <Image
                  src={sampleProduct.images[selectedImageIndex]}
                  alt={sampleProduct.name}
                  fill
                  className="object-cover"
                />
                
                {/* Discount Badge */}
                {sampleProduct.originalPrice && (
                  <div className="absolute top-4 left-4 bg-[#CD853F] text-white px-3 py-1 rounded-full text-sm font-bold">
                    Save ${sampleProduct.originalPrice - sampleProduct.price}
                  </div>
                )}

                {/* Featured Badge */}
                {sampleProduct.featured && (
                  <div className="absolute top-4 right-4 bg-[#8B4513] text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                    <StarIcon className="w-4 h-4 fill-current" />
                    Featured
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-3">
              {sampleProduct.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative aspect-square rounded-lg overflow-hidden transition-all duration-300 ${
                    selectedImageIndex === index
                      ? "ring-2 ring-[#8B4513] shadow-lg"
                      : "hover:shadow-md"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${sampleProduct.name} view ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Product Details */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Product Title and Category */}
            <div>
              <p className="text-sm font-semibold text-[#CD853F] uppercase tracking-wide mb-2">
                {sampleProduct.category}
              </p>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#8B4513] mb-3">
                {sampleProduct.name}
              </h1>
              
              {/* Reviews */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(sampleProduct.reviews.rating)
                          ? "text-[#CD853F] fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[#8B4513] font-medium">{sampleProduct.reviews.rating}</span>
                <span className="text-[#A0522D] text-sm">({sampleProduct.reviews.count} reviews)</span>
              </div>

              <p className="text-[#A0522D] leading-relaxed">
                {sampleProduct.description}
              </p>
            </div>

            {/* Pricing */}
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-3xl font-bold text-[#8B4513]">${sampleProduct.price}</span>
                {sampleProduct.originalPrice && (
                  <span className="text-lg text-[#A0522D] line-through">${sampleProduct.originalPrice}</span>
                )}
              </div>
              <p className="text-sm text-[#A0522D]">
                Free shipping on orders over $75 • {sampleProduct.stockCount} in stock
              </p>
            </div>

            {/* Customization Options */}
            <div className="space-y-4">
              {/* Color Selection */}
              <div>
                <label className="block text-[#8B4513] font-medium mb-2">
                  Color: {selectedColor}
                </label>
                <div className="flex gap-2">
                  {sampleProduct.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                        selectedColor === color
                          ? "bg-[#8B4513] text-white shadow-lg"
                          : "bg-white/80 text-[#8B4513] hover:bg-white hover:shadow-md"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              {sampleProduct.sizes && (
                <div>
                  <label className="block text-[#8B4513] font-medium mb-2">
                    Size: {selectedSize}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {sampleProduct.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                          selectedSize === size
                            ? "bg-[#8B4513] text-white shadow-lg"
                            : "bg-white/80 text-[#8B4513] hover:bg-white hover:shadow-md"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selection */}
              <div>
                <label className="block text-[#8B4513] font-medium mb-2">Quantity</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="w-10 h-10 rounded-full bg-white/80 border border-[#DEB887] flex items-center justify-center hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <MinusIcon className="w-4 h-4 text-[#8B4513]" />
                  </button>
                  <span className="text-lg font-medium text-[#8B4513] min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= sampleProduct.stockCount}
                    className="w-10 h-10 rounded-full bg-white/80 border border-[#DEB887] flex items-center justify-center hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <PlusIcon className="w-4 h-4 text-[#8B4513]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button className="w-full bg-[#8B4513] text-[#FFF8F0] py-3 px-6 rounded-full hover:bg-[#A0522D] transition-all duration-300 font-medium shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                <ShoppingCartIcon className="w-5 h-5" />
                Add to Cart • ${(sampleProduct.price * quantity).toFixed(0)}
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                <button className="bg-white/80 text-[#8B4513] py-2 px-4 rounded-full hover:bg-white transition-all duration-300 font-medium border-2 border-[#8B4513] flex items-center justify-center gap-2">
                  <HeartIcon className="w-4 h-4" />
                  Save
                </button>
                <button className="bg-white/80 text-[#8B4513] py-2 px-4 rounded-full hover:bg-white transition-all duration-300 font-medium border-2 border-[#8B4513] flex items-center justify-center gap-2">
                  <ShareIcon className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white/40 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <h3 className="font-semibold text-[#8B4513] mb-3">Why You'll Love It</h3>
              <ul className="space-y-2">
                {sampleProduct.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-[#A0522D]">
                    <CheckIcon className="w-4 h-4 text-[#CD853F] flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Product Information Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16"
        >
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/20 shadow-lg">
            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-1.5 md:gap-2 mb-4 md:mb-6">
              {[
                { id: "description", label: "Description" },
                { id: "care", label: "Care Instructions" },
                { id: "reviews", label: "Reviews" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 md:px-6 md:py-2 rounded-full font-medium transition-all duration-300 text-xs md:text-base ${
                    activeTab === tab.id
                      ? "bg-[#8B4513] text-white shadow-lg"
                      : "bg-white/80 text-[#8B4513] hover:bg-white hover:shadow-md"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="text-[#A0522D]">
              {activeTab === "description" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-[#8B4513] mb-3">About This Product</h3>
                    <p className="leading-relaxed mb-4">{sampleProduct.longDescription}</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-[#8B4513] mb-2">Materials</h4>
                      <ul className="space-y-1">
                        {sampleProduct.materials.map((material, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-[#CD853F] rounded-full" />
                            {material}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-[#8B4513] mb-2">Dimensions</h4>
                      <p>{sampleProduct.dimensions}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "care" && (
                <div>
                  <h3 className="text-xl font-semibold text-[#8B4513] mb-4">Care Instructions</h3>
                  <div className="grid gap-3">
                    {sampleProduct.careInstructions.map((instruction, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-white/40 rounded-lg">
                        <CheckIcon className="w-5 h-5 text-[#CD853F] flex-shrink-0" />
                        <span>{instruction}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "reviews" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-[#8B4513]">Customer Reviews</h3>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`w-5 h-5 ${
                              i < Math.floor(sampleProduct.reviews.rating)
                                ? "text-[#CD853F] fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-medium text-[#8B4513]">
                        {sampleProduct.reviews.rating} out of 5
                      </span>
                      <span className="text-sm">({sampleProduct.reviews.count} reviews)</span>
                    </div>
                  </div>
                  
                  <p className="text-center py-8 text-[#A0522D]">
                    Review system coming soon! We're working on bringing you authentic customer feedback.
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Related Products */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16"
        >
          <h2 className="text-3xl font-serif font-bold text-[#8B4513] text-center mb-8">
            You Might Also Like
          </h2>
          <div className="text-center">
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 px-8 py-3 bg-[#8B4513] text-[#FFF8F0] rounded-full hover:bg-[#A0522D] transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
            >
              View More Products
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Icons
const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const StarIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const MinusIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
  </svg>
);

const PlusIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const ShoppingCartIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5H21M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6" />
  </svg>
);

const HeartIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const ShareIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);
