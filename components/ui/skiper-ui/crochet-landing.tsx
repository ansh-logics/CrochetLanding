"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import React, { useRef, useState } from "react";
import Image from "next/image";

const CrochetLanding = () => {
  const ref = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { scrollYProgress } = useScroll({
    target: ref,
  });

  const products = [
    {
      title: "Cozy Blankets",
      description: "Warm, soft blankets perfect for any season",
      price: "$89 - $159",
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop&crop=center"
    },
    {
      title: "Baby Sets",
      description: "Adorable outfits and accessories for little ones",
      price: "$45 - $75",
      image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=300&fit=crop&crop=center"
    },
    {
      title: "Home Decor",
      description: "Beautiful pieces to brighten up your living space",
      price: "$25 - $95",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop&crop=center"
    },
    {
      title: "Scarves & Shawls",
      description: "Elegant accessories for every occasion",
      price: "$35 - $80",
      image: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400&h=300&fit=crop&crop=center"
    },
    {
      title: "Amigurumi Toys",
      description: "Adorable handcrafted stuffed animals and dolls",
      price: "$25 - $60",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&crop=center"
    },
    {
      title: "Kitchen Sets",
      description: "Pot holders, dishcloths, and kitchen accessories",
      price: "$15 - $45",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center"
    }
  ];

  const totalSlides = Math.ceil(products.length / 3); // Show 3 products at a time

  const scrollToSlide = (slideIndex: number) => {
    if (carouselRef.current) {
      const scrollAmount = slideIndex * (carouselRef.current.scrollWidth / totalSlides);
      carouselRef.current.scrollTo({
        left: scrollAmount,
        behavior: 'smooth'
      });
      setCurrentSlide(slideIndex);
    }
  };

  const nextSlide = () => {
    const next = currentSlide < totalSlides - 1 ? currentSlide + 1 : 0;
    scrollToSlide(next);
  };

  const prevSlide = () => {
    const prev = currentSlide > 0 ? currentSlide - 1 : totalSlides - 1;
    scrollToSlide(prev);
  };

  return (
    <section
      ref={ref}
      className="mx-auto flex w-screen flex-col items-center bg-gradient-to-b from-[#FFF8F0] to-[#F5E6D3] px-4 text-[#8B4513] pb-0"
    >
      <div className="h-full mt-12 md:mt-20 lg:mt-32 relative flex w-fit flex-col items-center justify-center gap-3 md:gap-5 text-center mb-8 md:mb-16">
        <h1 className="font-serif mr-[20vw] relative z-10 text-4xl sm:text-5xl md:text-7xl lg:text-9xl font-medium tracking-[-0.08em] text-[#8B4513] px-2">
          Fuzzy<br /> 
          <span className=" ml-[30vw] text-[#CD853F] italic text-[20vw] tangerine-bold">Loopz</span> <br />
        </h1>
        <p className="font-sans relative z-10 max-w-2xl text-base sm:text-lg md:text-xl font-medium text-[#A0522D] px-4">
          Where Every Stitch Tells a Story of Comfort & Joy
        </p>

        <CrochetThreadPath
          className="absolute left-1/2 -translate-x-1/2 top-0 z-0 opacity-60 hidden md:block"
          scrollYProgress={scrollYProgress}
        />
      </div>

      {/* Product Cards Carousel Section */}
      <div className="mt-12 md:mt-20 w-[95%] md:w-[85%] lg:w-[80%] mx-auto relative">
        {/* Glass-morphism scroll container with navigation */}
        <div className="relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-sm p-1 md:p-2">
          {/* Left Navigation Button */}
          <button
            onClick={prevSlide}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-300 flex items-center justify-center group"
          >
            <ChevronLeftIcon className="w-5 h-5 md:w-6 md:h-6 text-[#8B4513] group-hover:text-[#A0522D] transition-colors" />
          </button>

          {/* Right Navigation Button */}
          <button
            onClick={nextSlide}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-300 flex items-center justify-center group"
          >
            <ChevronRightIcon className="w-5 h-5 md:w-6 md:h-6 text-[#8B4513] group-hover:text-[#A0522D] transition-colors" />
          </button>

          <div 
            ref={carouselRef}
            className="overflow-x-auto overflow-y-hidden scrollbar-none px-12 md:px-16 py-2"
            style={{
              maskImage: 'linear-gradient(to right, transparent 0%, black 50px, black calc(100% - 50px), transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 50px, black calc(100% - 50px), transparent 100%)'
            }}
            onScroll={() => {
              if (carouselRef.current) {
                const scrollLeft = carouselRef.current.scrollLeft;
                const slideWidth = carouselRef.current.scrollWidth / totalSlides;
                const newSlide = Math.round(scrollLeft / slideWidth);
                setCurrentSlide(newSlide);
              }
            }}
          >
            <div className="flex gap-3 md:gap-6 pb-4 min-w-max">
              {products.map((product, index) => (
                <ProductCard
                  key={index}
                  title={product.title}
                  description={product.description}
                  price={product.price}
                  delay={0.1 * (index + 1)}
                  image={product.image}
                />
              ))}
            </div>
          </div>
          

        </div>

        {/* Carousel Dots Indicator */}
        <div className="flex justify-center mt-6 gap-2">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentSlide === index 
                  ? 'bg-[#8B4513] w-8' 
                  : 'bg-[#8B4513]/30 hover:bg-[#8B4513]/50'
              }`}
            />
          ))}
        </div>

        {/* Show More Button */}
        <div className="flex justify-center md:justify-end mt-4 md:mt-6">
          <button className="bg-[#8B4513] text-[#FFF8F0] px-4 md:px-6 py-2 md:py-3 rounded-full hover:bg-[#A0522D] transition-all duration-300 font-medium shadow-lg hover:shadow-xl flex items-center gap-2 group text-sm md:text-base">
            View Full Catalog
            <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* About Section */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="mt-20 md:mt-32 w-full max-w-6xl mx-auto px-4 relative z-10"
      >
        <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-medium text-[#8B4513] mb-6 md:mb-8">
              Our Story
            </h2>
            <p className="text-base md:text-lg text-[#A0522D] mb-4 md:mb-6 leading-relaxed">
              Started as a family passion in 2020, FuzzyLoopz has grown into a beloved brand 
              that celebrates the timeless art of crochet. Each piece is carefully handcrafted 
              with premium yarns and attention to detail.
            </p>
            <p className="text-base md:text-lg text-[#A0522D] leading-relaxed">
              From cozy home essentials to adorable gifts, we bring warmth and comfort 
              to families worldwide through the ancient craft of crochet.
            </p>
          </div>
          <div className="relative">
            <div className="bg-gradient-to-br from-[#F5DEB3] to-[#DEB887] rounded-2xl p-8 shadow-xl">
              <div className="text-center">
                <div className="text-8xl mb-4">🧶</div>
                <h3 className="text-2xl font-semibold text-[#8B4513] mb-2">100% Handmade</h3>
                <p className="text-[#A0522D]">Every stitch crafted with love and precision</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="mt-20 md:mt-32 w-full max-w-6xl mx-auto px-4 relative z-10"
      >
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-medium text-[#8B4513] text-center mb-10 md:mb-16">
          Why Choose FuzzyLoopz
        </h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          <FeatureCard 
            iconType="sustainable"
            title="Sustainable Materials"
            description="We use eco-friendly, natural fibers that are gentle on both you and the environment."
          />
          <FeatureCard 
            iconType="custom"
            title="Custom Orders"
            description="Have something special in mind? We create personalized pieces tailored to your vision."
          />
          <FeatureCard 
            iconType="shipping"
            title="Global Shipping"
            description="Bringing handcrafted comfort to homes worldwide with careful packaging and fast delivery."
          />
        </div>
      </motion.div>

      {/* Newsletter Section */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="mt-20 md:mt-32 w-full max-w-4xl mx-auto px-4 text-center relative z-10"
      >
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 md:p-12 shadow-xl border border-white/20">
          <h2 className="text-2xl md:text-4xl font-serif font-medium text-[#8B4513] mb-4 md:mb-6">
            Stay Connected
          </h2>
          <p className="text-base md:text-lg text-[#A0522D] mb-6 md:mb-8">
            Get updates on new patterns, seasonal collections, and exclusive offers
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email"
              className="flex-1 px-4 md:px-6 py-2 md:py-3 rounded-full bg-white/80 border border-[#DEB887] focus:outline-none focus:ring-2 focus:ring-[#CD853F] text-[#8B4513] text-sm md:text-base"
            />
            <button className="px-6 md:px-8 py-2 md:py-3 bg-[#8B4513] text-[#FFF8F0] rounded-full hover:bg-[#A0522D] transition-colors duration-300 font-medium text-sm md:text-base">
              Subscribe
            </button>
          </div>
        </div>
      </motion.div>

      {/* Footer Section */}
      <footer className="mt-20 md:mt-32 w-full">
        {/* Yarn connection/knot decoration */}
        <div className="justify-center mb-8 hidden md:flex">
          <svg width="100" height="80" viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M20 0 Q50 20 80 0 Q70 40 50 40 Q30 40 20 0"
              fill="#F4A460"
              opacity="0.8"
            />
            <path
              d="M25 5 Q50 25 75 5 Q65 35 50 35 Q35 35 25 5"
              fill="#CD853F"
              opacity="0.6"
            />
          </svg>
        </div>
        
        <div className="rounded-t-[3rem] font-serif w-full bg-[#8B4513] pb-16 pt-16 text-[#FFF8F0] relative overflow-hidden">
          {/* Subtle crochet pattern overlay on footer */}
          <div className="absolute inset-0 opacity-5 hidden md:block">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="footer-crochet-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M30,10 Q40,20 30,30 Q20,20 30,10" stroke="#FFF8F0" strokeWidth="2" fill="none"/>
                  <path d="M10,30 Q20,40 30,30 Q20,20 10,30" stroke="#FFF8F0" strokeWidth="2" fill="none"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#footer-crochet-pattern)" />
            </svg>
          </div>
          
          <div className="max-w-6xl mx-auto px-4">
            <h1 className="text-center text-[12vw] sm:text-[8vw] lg:text-[6vw] font-bold leading-[0.9] tracking-tighter mb-12 relative z-10">
              FuzzyLoopz
            </h1>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 relative z-10">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-[#F4A460]">Products</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-[#F4A460] transition-colors">Blankets</a></li>
                  <li><a href="#" className="hover:text-[#F4A460] transition-colors">Baby Items</a></li>
                  <li><a href="#" className="hover:text-[#F4A460] transition-colors">Home Decor</a></li>
                  <li><a href="#" className="hover:text-[#F4A460] transition-colors">Accessories</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4 text-[#F4A460]">Support</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-[#F4A460] transition-colors">Care Instructions</a></li>
                  <li><a href="#" className="hover:text-[#F4A460] transition-colors">Size Guide</a></li>
                  <li><a href="#" className="hover:text-[#F4A460] transition-colors">Custom Orders</a></li>
                  <li><a href="#" className="hover:text-[#F4A460] transition-colors">Returns</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4 text-[#F4A460]">Company</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-[#F4A460] transition-colors">Our Story</a></li>
                  <li><a href="#" className="hover:text-[#F4A460] transition-colors">Sustainability</a></li>
                  <li><a href="#" className="hover:text-[#F4A460] transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-[#F4A460] transition-colors">Press</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4 text-[#F4A460]">Connect</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-[#F4A460] transition-colors">Instagram</a></li>
                  <li><a href="#" className="hover:text-[#F4A460] transition-colors">Pinterest</a></li>
                  <li><a href="#" className="hover:text-[#F4A460] transition-colors">YouTube</a></li>
                  <li><a href="#" className="hover:text-[#F4A460] transition-colors">Newsletter</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-[#A0522D]/30 pt-8 flex flex-col md:flex-row justify-between items-center text-sm relative z-10">
              <div className="flex items-center gap-8 mb-4 md:mb-0">
                <p>© 2025 FuzzyLoopz. All rights reserved.</p>
                <p>Handmade with love since 2020</p>
              </div>
              <div className="flex items-center gap-6">
                <a href="#" className="hover:text-[#F4A460] transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-[#F4A460] transition-colors">Terms of Service</a>
                <p>contact@fuzzyloopz.com</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </section>
  );
};

const ProductCard = ({
  title,
  description,
  price,
  delay,
  image
}: {
  title: string;
  description: string;
  price: string;
  delay: number;
  image: string;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay }}
      viewport={{ once: true }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 md:p-4 shadow-lg hover:shadow-xl transition-all duration-300 w-[240px] md:w-[280px] min-w-[240px] md:min-w-[280px] flex-shrink-0 group"
    >
      <div className="h-36 md:h-44 rounded-xl mb-3 md:mb-4 relative overflow-hidden bg-gradient-to-br from-[#F5DEB3] to-[#DEB887]">
        <Image 
          src={image} 
          alt={title}
          className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
          width={280}
          height={176}
        />
        {/* Themed icon overlay */}
        <div className="absolute top-2 md:top-3 right-2 md:right-3 w-8 md:w-10 h-8 md:h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center">
          <CrochetIcon className="w-4 md:w-5 h-4 md:h-5 text-[#8B4513]" />
        </div>
      </div>
      <div className="space-y-1 md:space-y-2">
        <h3 className="text-base md:text-lg font-bold text-[#8B4513] leading-tight">{title}</h3>
        <p className="text-[#A0522D] text-xs md:text-sm leading-relaxed">{description}</p>
        <p className="text-base md:text-lg font-semibold text-[#8B4513]">{price}</p>
      </div>
    </motion.div>
  );
};

const FeatureCard = ({
  iconType,
  title,
  description
}: {
  iconType: 'sustainable' | 'custom' | 'shipping';
  title: string;
  description: string;
}) => {
  const getIcon = () => {
    switch (iconType) {
      case 'sustainable':
        return <LeafIcon className="w-12 h-12 text-[#8B4513]" />;
      case 'custom':
        return <HeartIcon className="w-12 h-12 text-[#8B4513]" />;
      case 'shipping':
        return <GlobeIcon className="w-12 h-12 text-[#8B4513]" />;
      default:
        return <CrochetIcon className="w-12 h-12 text-[#8B4513]" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 md:p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20"
    >
      <div className="flex justify-center mb-4 md:mb-6">
        <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-[#F5DEB3] to-[#DEB887] rounded-full flex items-center justify-center">
          {getIcon()}
        </div>
      </div>
      <h3 className="text-xl md:text-2xl font-semibold text-[#8B4513] mb-3 md:mb-4">{title}</h3>
      <p className="text-sm md:text-base text-[#A0522D] leading-relaxed">{description}</p>
    </motion.div>
  );
};

// Custom themed icons
const CrochetIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor"/>
    <path d="M8 8c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm6 0c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2z" fill="currentColor"/>
    <path d="M7.5 15.5c.83 1.24 2.24 2 3.75 2h1.5c1.51 0 2.92-.76 3.75-2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
  </svg>
);

const LeafIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C8.5 6 8.5 12 12 16c3.5-4 3.5-10 0-14z" fill="currentColor"/>
    <path d="M12 16c0 3-2.5 4-2.5 4s2.5-1 2.5-4z" fill="currentColor" opacity="0.6"/>
  </svg>
);

const HeartIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor"/>
  </svg>
);

const GlobeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const ChevronLeftIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 12h14m-7-7l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CrochetThreadPath = ({
  className,
  scrollYProgress,
}: {
  className: string;
  scrollYProgress: import("framer-motion").MotionValue<number>;
}) => {
  const pathLength = useTransform(scrollYProgress, [0, 1], [0.5, 1]);

  return (
    <svg
      width="1278"
      height="2319"
      viewBox="0 0 1278 2319"
      fill="none"
      overflow="visible"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <motion.path
        d="M876.605 394.131C788.982 335.917 696.198 358.139 691.836 416.303C685.453 501.424 853.722 498.43 941.95 409.714C1016.1 335.156 1008.64 186.907 906.167 142.846C807.014 100.212 712.699 198.494 789.049 245.127C889.053 306.207 986.062 116.979 840.548 43.3233C743.932 -5.58141 678.027 57.1682 672.279 112.188C666.53 167.208 712.538 172.943 736.353 163.088C760.167 153.234 764.14 120.924 746.651 93.3868C717.461 47.4252 638.894 77.8642 601.018 116.979C568.164 150.908 557 201.079 576.467 246.924C593.342 286.664 630.24 310.55 671.68 302.614C756.114 286.446 729.747 206.546 681.86 186.442C630.54 164.898 492 209.318 495.026 287.644C496.837 334.494 518.402 366.466 582.455 367.287C680.013 368.538 771.538 299.456 898.634 292.434C1007.02 286.446 1192.67 309.384 1242.36 382.258C1266.99 418.39 1273.65 443.108 1247.75 474.477C1217.32 511.33 1149.4 511.259 1096.84 466.093C1044.29 420.928 1029.14 380.576 1033.97 324.172C1038.31 273.428 1069.55 228.986 1117.2 216.384C1152.2 207.128 1188.29 213.629 1194.45 245.127C1201.49 281.062 1132.22 280.104 1100.44 272.673C1065.32 264.464 1044.22 234.837 1032.77 201.413C1019.29 162.061 1029.71 131.126 1056.44 100.965C1086.19 67.4032 1143.96 54.5526 1175.78 86.1513C1207.02 117.17 1186.81 143.379 1156.22 166.691C1112.57 199.959 1052.57 186.238 999.784 155.164C957.312 130.164 899.171 63.7054 931.284 26.3214C952.068 2.12513 996.288 3.87363 1007.22 43.58C1018.15 83.2749 1003.56 122.644 975.969 163.376C948.377 204.107 907.272 255.122 913.558 321.045C919.727 385.734 990.968 497.068 1063.84 503.35C1111.46 507.456 1166.79 511.984 1175.68 464.527C1191.52 379.956 1101.26 334.985 1030.29 377.017C971.109 412.064 956.297 483.647 953.797 561.655C947.587 755.413 1197.56 941.828 936.039 1140.66C745.771 1285.32 321.926 950.737 134.536 1202.19C-6.68295 1391.68 -53.4837 1655.38 131.935 1760.5C478.381 1956.91 1124.19 1515 1201.28 1997.83C1273.66 2451.23 100.805 1864.7 303.794 2668.89"
        stroke="#F4A460"
        strokeWidth="20"
        style={{
          pathLength,
          strokeDashoffset: useTransform(pathLength, (value) => 1 - value),
        }}
      />
    </svg>
  );
};



export { CrochetLanding };

/**
 * Crochet Landing Page — React + Framer Motion
 * A beautiful landing page for a crochet company
 * Features smooth scroll animations and modern design
 *
 * License & Usage:
 * - Free to use and modify in both personal and commercial projects.
 * - Created as an example for crochet business websites.
 *
 * Author: GitHub Copilot
 */
