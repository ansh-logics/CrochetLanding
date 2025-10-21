"use client";

import { motion } from "framer-motion";
import React, { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useProduct } from '@/hooks/useProduct';
import { useCart, CartItem } from '@/contexts/CartContext';

interface ProductViewPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProductViewPage({ params }: ProductViewPageProps) {
  const resolvedParams = use(params);
  const { product, loading, error } = useProduct(resolvedParams.id);
  const { cartCount, addToCart } = useCart();
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "care" | "reviews">("description");
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showAddedToCart, setShowAddedToCart] = useState(false);

  // Set default color when product loads
  useEffect(() => {
    if (product && product.Colors.length > 0 && !selectedColor) {
      setSelectedColor(product.Colors[0]);
    }
  }, [product, selectedColor]);

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!product || !selectedColor) return;

    setIsAddingToCart(true);

    const mainImage = product.ImageURLs[0] || '';

    const cartItem: CartItem = {
      productId: product.id.toString(),
      name: product.Title,
      price: product.Price,
      selectedColor,
      quantity,
      image: mainImage,
    };

    addToCart(cartItem);

    setShowAddedToCart(true);
    setTimeout(() => setShowAddedToCart(false), 2000);
    
    setIsAddingToCart(false);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFF8F0] to-[#F5E6D3] pt-24">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-24 mb-8"></div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="aspect-square bg-gray-200 rounded-2xl"></div>
                <div className="grid grid-cols-4 gap-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="aspect-square bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFF8F0] to-[#F5E6D3] pt-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#8B4513] mb-4">Product Not Found</h1>
          <p className="text-[#A0522D] mb-8">{error}</p>
          <Link 
            href="/catalog"
            className="inline-flex items-center gap-2 bg-[#8B4513] text-[#FFF8F0] px-6 py-3 rounded-full hover:bg-[#A0522D] transition-colors"
          >
            <ChevronRightIcon className="h-4 w-4 rotate-180" />
            Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const displayImages = product.ImageURLs;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F0] to-[#F5E6D3] pt-24">
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
          <span className="text-[#8B4513] font-medium truncate">{product.Title}</span>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 pb-16 md:pb-20">
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="relative bg-white/60 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg border border-white/20">
              <div className="aspect-square relative">
                <Image
                  src={displayImages[selectedImageIndex] || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='}
                  alt={product.Title}
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {displayImages.map((imageUrl: string, index: number) => (
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
                    src={imageUrl}
                    alt={`${product.Title} view ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Product Title and Category */}
            <div>
              <p className="text-sm font-semibold text-[#CD853F] uppercase tracking-wide mb-2">
                Handcrafted Item
              </p>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#8B4513] mb-3">
                {product.Title}
              </h1>
              
              {/* Reviews */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`w-5 h-5 ${
                        i < 4
                          ? "text-[#CD853F] fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[#8B4513] font-medium">4.5</span>
                <span className="text-[#A0522D] text-sm">(12 reviews)</span>
              </div>

              <p className="text-[#A0522D] leading-relaxed">
                {product.Description}
              </p>
            </div>

            {/* Pricing */}
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-3xl font-bold text-[#8B4513]">${product.Price}</span>
              </div>
              <p className="text-sm text-[#A0522D]">
                Free shipping on orders over $75 • In stock
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
                  {product.Colors.map((color: string) => (
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
                    className="w-10 h-10 rounded-full bg-white/80 border border-[#DEB887] flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <PlusIcon className="w-4 h-4 text-[#8B4513]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button 
                onClick={handleAddToCart}
                disabled={isAddingToCart || !selectedColor}
                className={`w-full py-3 px-6 rounded-full font-medium shadow-lg hover:shadow-xl flex items-center justify-center gap-2 transition-all duration-300 ${
                  showAddedToCart
                    ? 'bg-green-600 text-white'
                    : isAddingToCart || !selectedColor
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#8B4513] text-[#FFF8F0] hover:bg-[#A0522D]'
                }`}
              >
                <ShoppingCartIcon className="w-5 h-5" />
                {showAddedToCart ? 'Added to Cart!' : isAddingToCart ? 'Adding...' : `Add to Cart • $${(product.Price * quantity).toFixed(0)}`}
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

            {/* Cart Counter Display */}
            {cartCount > 0 && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-green-800 font-medium">
                  🛒 {cartCount} item{cartCount !== 1 ? 's' : ''} in cart
                </p>
              </div>
            )}

            {/* Features */}
            <div className="bg-white/40 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <h3 className="font-semibold text-[#8B4513] mb-3">Why You'll Love It</h3>
              <ul className="space-y-2">
                {[
                  "Handcrafted with premium yarns",
                  "Machine washable for easy care", 
                  "Hypoallergenic and baby-safe",
                  "Customizable colors available",
                  "Free gift wrapping included"
                ].map((feature, index) => (
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
                    <p className="leading-relaxed mb-4">{product.Description}</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-[#8B4513] mb-2">Materials</h4>
                      <ul className="space-y-1">
                        {["100% Cotton Yarn", "Hypoallergenic", "Natural Dyes"].map((material, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-[#CD853F] rounded-full" />
                            {material}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-[#8B4513] mb-2">Dimensions</h4>
                      <p>Varies by item - handcrafted to order</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "care" && (
                <div>
                  <h3 className="text-xl font-semibold text-[#8B4513] mb-4">Care Instructions</h3>
                  <div className="grid gap-3">
                    {[
                      "Hand wash cold, lay flat to dry",
                      "Do not bleach or use harsh chemicals", 
                      "Store in a cool, dry place",
                      "Gentle brushing to maintain texture"
                    ].map((instruction, index) => (
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
                              i < 4
                                ? "text-[#CD853F] fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-medium text-[#8B4513]">
                        4.5 out of 5
                      </span>
                      <span className="text-sm">(12 reviews)</span>
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
