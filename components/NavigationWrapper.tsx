"use client";

import { usePathname } from 'next/navigation';
import PillNav from './PillNav';
import logo from '../public/vercel.svg';

export default function NavigationWrapper() {
  const pathname = usePathname();
  
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full flex justify-center px-4">
      <PillNav
        logo={logo}
        logoAlt="FuzzyLoopz Logo"
        items={[
          { label: 'Home', href: '/' },
          { label: 'Catalog', href: '/catalog' },
          { label: 'Product', href: '/product' },
          { label: 'About', href: '/about' },
          { label: 'Contact', href: '/contact' }
        ]}
        activeHref={pathname}
        className="custom-nav"
        ease="power2.easeOut"
        baseColor="#f8c599"
        pillColor="#ffffff"
        hoveredPillTextColor="#ffffff"
        pillTextColor="#000000"
      />
    </div>
  );
}
