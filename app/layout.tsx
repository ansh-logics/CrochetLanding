import type { Metadata } from "next";
import { Geist, Geist_Mono, Pacifico, Tangerine } from "next/font/google";
import "./globals.css";
import NavigationWrapper from '@/components/NavigationWrapper';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const pacifico = Pacifico({
  variable: "--font-pacifico",
  subsets: ["latin"],
  weight: "400",
});

const tangerine = Tangerine({
  variable: "--font-tangerine",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "FuzzyLoopz - Handcrafted Crochet Creations",
  description: "Where Every Stitch Tells a Story of Comfort & Joy. Beautiful handmade crochet blankets, baby sets, home decor, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${pacifico.variable} ${tangerine.variable} antialiased`}
      >
        <NavigationWrapper />
        {children}
      </body>
    </html>
  );
}
