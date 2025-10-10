"use client";

import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";

// Product type definition
type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  priceRange?: string;
  category: string;
  image: string;
  featured?: boolean;
  inStock: boolean;
  customizable?: boolean;
};

// Sample products data
const products: Product[] = [
  // Cozy Blankets
  {
    id: 1,
    name: "Autumn Sunset Blanket",
    description: "A warm, luxurious blanket with earthy tones perfect for cozy evenings",
    price: 129,
    priceRange: "$89 - $159",
    category: "Cozy Blankets",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop",
    featured: true,
    inStock: true,
    customizable: true,
  },
  {
    id: 2,
    name: "Cloud Nine Throw",
    description: "Ultra-soft, cloud-like texture in gentle pastels",
    price: 89,
    priceRange: "$89 - $159",
    category: "Cozy Blankets",
    image: "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=600&h=600&fit=crop",
    inStock: true,
    customizable: true,
  },
  {
    id: 3,
    name: "Winter Warmth Blanket",
    description: "Extra thick and cozy for the coldest winter nights",
    price: 159,
    priceRange: "$89 - $159",
    category: "Cozy Blankets",
    image: "https://images.unsplash.com/photo-1631889993959-41b4e9c6e3c5?w=600&h=600&fit=crop",
    inStock: true,
    customizable: false,
  },

  // Baby Sets
  {
    id: 4,
    name: "Sweet Dreams Baby Set",
    description: "Complete outfit with hat, booties, and matching blanket",
    price: 65,
    priceRange: "$45 - $75",
    category: "Baby Sets",
    image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&h=600&fit=crop",
    featured: true,
    inStock: true,
    customizable: true,
  },
  {
    id: 5,
    name: "Little Explorer Set",
    description: "Adorable adventure-themed baby accessories",
    price: 55,
    priceRange: "$45 - $75",
    category: "Baby Sets",
    image: "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=600&h=600&fit=crop",
    inStock: true,
    customizable: true,
  },
  {
    id: 6,
    name: "Pastel Perfection Set",
    description: "Soft pastel colors perfect for newborns",
    price: 45,
    priceRange: "$45 - $75",
    category: "Baby Sets",
    image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&h=600&fit=crop",
    inStock: true,
    customizable: false,
  },

  // Home Decor
  {
    id: 7,
    name: "Bohemian Wall Hanging",
    description: "Handcrafted macramé-style wall art to elevate your space",
    price: 75,
    priceRange: "$25 - $95",
    category: "Home Decor",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=600&fit=crop",
    featured: true,
    inStock: true,
    customizable: true,
  },
  {
    id: 8,
    name: "Textured Cushion Covers",
    description: "Set of 4 decorative cushion covers in neutral tones",
    price: 65,
    priceRange: "$25 - $95",
    category: "Home Decor",
    image: "https://images.unsplash.com/photo-1556228852-80980848a37f?w=600&h=600&fit=crop",
    inStock: true,
    customizable: true,
  },
  {
    id: 9,
    name: "Cozy Floor Pouf",
    description: "Comfortable seating option with beautiful crochet patterns",
    price: 95,
    priceRange: "$25 - $95",
    category: "Home Decor",
    image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600&h=600&fit=crop",
    inStock: true,
    customizable: false,
  },
  {
    id: 10,
    name: "Table Runner Set",
    description: "Elegant table decor with matching placemats",
    price: 45,
    priceRange: "$25 - $95",
    category: "Home Decor",
    image: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=600&fit=crop",
    inStock: true,
    customizable: true,
  },

  // Scarves & Shawls
  {
    id: 11,
    name: "Infinity Elegance Scarf",
    description: "Versatile infinity scarf in rich autumn colors",
    price: 55,
    priceRange: "$35 - $80",
    category: "Scarves & Shawls",
    image: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&h=600&fit=crop",
    featured: true,
    inStock: true,
    customizable: true,
  },
  {
    id: 12,
    name: "Lace Evening Shawl",
    description: "Delicate lace pattern perfect for special occasions",
    price: 80,
    priceRange: "$35 - $80",
    category: "Scarves & Shawls",
    image: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=600&h=600&fit=crop",
    inStock: true,
    customizable: false,
  },
  {
    id: 13,
    name: "Winter Wrap Scarf",
    description: "Extra long and warm for cold weather",
    price: 65,
    priceRange: "$35 - $80",
    category: "Scarves & Shawls",
    image: "https://images.unsplash.com/photo-1507680434567-5739c80be1ac?w=600&h=600&fit=crop",
    inStock: true,
    customizable: true,
  },

  // Amigurumi Toys
  {
    id: 14,
    name: "Cuddle Bunny",
    description: "Adorable handcrafted bunny perfect for children",
    price: 35,
    priceRange: "$25 - $60",
    category: "Amigurumi Toys",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop",
    featured: true,
    inStock: true,
    customizable: true,
  },
  {
    id: 15,
    name: "Woodland Friends Set",
    description: "Set of 3 forest animals: fox, bear, and owl",
    price: 60,
    priceRange: "$25 - $60",
    category: "Amigurumi Toys",
    image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&h=600&fit=crop",
    inStock: true,
    customizable: false,
  },
  {
    id: 16,
    name: "Ocean Creatures",
    description: "Cute sea-themed amigurumi toys",
    price: 40,
    priceRange: "$25 - $60",
    category: "Amigurumi Toys",
    image: "https://images.unsplash.com/photo-1587402092301-725e37c70fd8?w=600&h=600&fit=crop",
    inStock: true,
    customizable: true,
  },
  {
    id: 17,
    name: "Dinosaur Duo",
    description: "Two adorable dinosaur friends",
    price: 45,
    priceRange: "$25 - $60",
    category: "Amigurumi Toys",
    image: "https://images.unsplash.com/photo-1599751449318-76c0e8c7bb57?w=600&h=600&fit=crop",
    inStock: true,
    customizable: true,
  },

  // Kitchen Sets
  {
    id: 18,
    name: "Farmhouse Kitchen Set",
    description: "Complete set with pot holders, dishcloths, and towels",
    price: 35,
    priceRange: "$15 - $45",
    category: "Kitchen Sets",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=600&fit=crop",
    featured: true,
    inStock: true,
    customizable: true,
  },
  {
    id: 19,
    name: "Cotton Dishcloth Set",
    description: "Set of 6 eco-friendly dishcloths in various colors",
    price: 25,
    priceRange: "$15 - $45",
    category: "Kitchen Sets",
    image: "https://images.unsplash.com/photo-1556911261-6bd341186b2f?w=600&h=600&fit=crop",
    inStock: true,
    customizable: true,
  },
  {
    id: 20,
    name: "Pot Holder Collection",
    description: "Heat-resistant pot holders in modern designs",
    price: 20,
    priceRange: "$15 - $45",
    category: "Kitchen Sets",
    image: "https://images.unsplash.com/photo-1584990347498-7ab5142e6190?w=600&h=600&fit=crop",
    inStock: true,
    customizable: false,
  },
  {
    id: 21,
    name: "Hanging Basket Set",
    description: "Set of 3 decorative hanging storage baskets",
    price: 45,
    priceRange: "$15 - $45",
    category: "Kitchen Sets",
    image: "https://images.unsplash.com/photo-1595078475328-1ab05d0a6a0e?w=600&h=600&fit=crop",
    inStock: true,
    customizable: true,
  },
];

const categories = ["All", "Cozy Blankets", "Baby Sets", "Home Decor", "Scarves & Shawls", "Amigurumi Toys", "Kitchen Sets"];

export default function CatalogPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<"featured" | "price-low" | "price-high" | "name">("featured");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort products
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "featured":
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return sorted;
  }, [selectedCategory, sortBy, searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F0] to-[#F5E6D3]">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="pt-20 sm:pt-24 md:pt-28 pb-8 md:pb-12 px-4"
      >
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-serif font-bold text-[#8B4513] mb-3 md:mb-4 leading-tight">
            Our <span className="text-[#CD853F] italic tangerine-bold">Catalog</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-[#A0522D] max-w-2xl mx-auto mb-6 md:mb-8 px-4">
            Discover our collection of handcrafted crochet creations, each made with love and sustainable materials
          </p>

          {/* Brand Values Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 lg:gap-8 mt-6 md:mt-8"
          >
            <ValueBadge icon="✋" text="100% Handmade" />
            <ValueBadge icon="🌿" text="Sustainable" />
            <ValueBadge icon="✨" text="Custom Orders" />
            <ValueBadge icon="🌍" text="Global Shipping" />
          </motion.div>
        </div>
      </motion.div>

      {/* Filters and Search Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="max-w-7xl mx-auto px-4 mb-8 md:mb-12"
      >
        {/* Search Bar */}
        <div className="mb-4 md:mb-6">
          <div className="relative max-w-full md:max-w-md mx-auto">
            <input
              type="text"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 md:px-6 md:py-3 rounded-full bg-white/80 backdrop-blur-sm border border-[#DEB887] focus:outline-none focus:ring-2 focus:ring-[#CD853F] text-[#8B4513] placeholder-[#A0522D]/60 text-sm md:text-base"
            />
            <SearchIcon className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-[#A0522D]" />
          </div>
        </div>

        {/* Category Filters */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-3 md:p-4 border border-white/20 shadow-lg">
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-3 md:mb-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1.5 md:px-6 md:py-2 rounded-full font-medium transition-all duration-300 text-xs md:text-base ${
                  selectedCategory === category
                    ? "bg-[#8B4513] text-[#FFF8F0] shadow-lg"
                    : "bg-white/80 text-[#8B4513] hover:bg-white hover:shadow-md"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Sort Options */}
          <div className="flex flex-col md:flex-row md:justify-between items-center gap-3 md:gap-4">
            <div className="text-[#A0522D] font-medium text-sm md:text-base text-center md:text-left">
              Showing {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
            </div>
            <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto justify-center md:justify-end">
              <span className="text-[#8B4513] font-medium text-xs md:text-base whitespace-nowrap">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="flex-1 md:flex-none px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white/80 border border-[#DEB887] focus:outline-none focus:ring-2 focus:ring-[#CD853F] text-[#8B4513] cursor-pointer text-xs md:text-base"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        <AnimatePresence mode="wait">
          {filteredProducts.length > 0 ? (
            <motion.div
              key={selectedCategory + sortBy + searchQuery}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredProducts.map((product, index) => (
                <CatalogProductCard key={product.id} product={product} index={index} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-12 md:py-20 px-4"
            >
              <div className="text-5xl md:text-6xl mb-3 md:mb-4">🧶</div>
              <h3 className="text-xl md:text-2xl font-semibold text-[#8B4513] mb-2">No products found</h3>
              <p className="text-sm md:text-base text-[#A0522D] mb-4 md:mb-6">Try adjusting your filters or search query</p>
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  setSearchQuery("");
                }}
                className="px-5 md:px-6 py-2.5 md:py-3 bg-[#8B4513] text-[#FFF8F0] rounded-full hover:bg-[#A0522D] transition-colors duration-300 font-medium text-sm md:text-base"
              >
                Clear All Filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Call to Action Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto px-4 pb-16 md:pb-20"
      >
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl md:rounded-3xl p-6 sm:p-8 md:p-12 shadow-xl border border-white/20 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-medium text-[#8B4513] mb-3 md:mb-4">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-base sm:text-lg text-[#A0522D] mb-6 md:mb-8">
            We offer custom orders! Let us create something special just for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
            <Link
              href="/contact"
              className="px-6 sm:px-8 py-2.5 sm:py-3 bg-[#8B4513] text-[#FFF8F0] rounded-full hover:bg-[#A0522D] transition-all duration-300 font-medium shadow-lg hover:shadow-xl inline-flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              Request Custom Order
              <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
            <Link
              href="/"
              className="px-6 sm:px-8 py-2.5 sm:py-3 bg-white/80 text-[#8B4513] rounded-full hover:bg-white transition-all duration-300 font-medium border-2 border-[#8B4513] inline-flex items-center justify-center text-sm sm:text-base"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Component: Value Badge
const ValueBadge = ({ icon, text }: { icon: string; text: string }) => (
  <div className="flex items-center gap-1.5 sm:gap-2 bg-white/60 backdrop-blur-sm px-2.5 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2 rounded-full border border-white/20 shadow-md">
    <span className="text-lg sm:text-xl md:text-2xl">{icon}</span>
    <span className="text-xs sm:text-sm md:text-sm font-medium text-[#8B4513] whitespace-nowrap">{text}</span>
  </div>
);

// Component: Catalog Product Card
const CatalogProductCard = ({ product, index }: { product: Product; index: number }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group"
    >
      {/* Product Image */}
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative h-64 overflow-hidden bg-gradient-to-br from-[#F5DEB3] to-[#DEB887]">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className={`object-cover group-hover:scale-110 transition-transform duration-500 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.featured && (
              <span className="px-3 py-1 bg-[#CD853F] text-white text-xs font-bold rounded-full">
                ⭐ Featured
              </span>
            )}
            {product.customizable && (
              <span className="px-3 py-1 bg-[#8B4513] text-white text-xs font-bold rounded-full">
                ✨ Customizable
              </span>
            )}
          </div>

          {/* Stock Status */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <span className="px-4 py-2 bg-white/90 text-[#8B4513] font-bold rounded-full">
                Out of Stock
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-5">
        <div className="mb-3">
          <span className="text-xs font-semibold text-[#CD853F] uppercase tracking-wide">
            {product.category}
          </span>
        </div>
        
        <Link href={`/product/${product.id}`}>
          <h3 className="text-xl font-bold text-[#8B4513] mb-2 group-hover:text-[#A0522D] transition-colors cursor-pointer">
            {product.name}
          </h3>
        </Link>
        
        <p className="text-sm text-[#A0522D] mb-4 line-clamp-2">{product.description}</p>

        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-2xl font-bold text-[#8B4513]">${product.price}</div>
            {product.priceRange && (
              <div className="text-xs text-[#A0522D]">{product.priceRange}</div>
            )}
          </div>
          <div className="flex items-center gap-1 text-[#CD853F]">
            <StarIcon className="w-4 h-4 fill-current" />
            <StarIcon className="w-4 h-4 fill-current" />
            <StarIcon className="w-4 h-4 fill-current" />
            <StarIcon className="w-4 h-4 fill-current" />
            <StarIcon className="w-4 h-4 fill-current" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            disabled={!product.inStock}
            className={`flex-1 py-3 rounded-full font-medium transition-all duration-300 ${
              product.inStock
                ? "bg-[#8B4513] text-[#FFF8F0] hover:bg-[#A0522D] hover:shadow-lg"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {product.inStock ? "Add to Cart" : "Out of Stock"}
          </button>
          <Link href={`/product/${product.id}`} className="px-4 py-3 bg-white border-2 border-[#8B4513] text-[#8B4513] rounded-full hover:bg-[#8B4513] hover:text-white transition-all duration-300 inline-flex items-center justify-center">
            <EyeIcon className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

// Icons
const SearchIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const StarIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const EyeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);
