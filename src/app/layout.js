import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Providers from "@/components/Providers";
import prisma from '@/lib/prisma';

const geist = Geist({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  display: 'swap',
});

export default function RootLayout({ children }) {
  return (
    <html lang="ru" className={`${geist.className} ${geistMono.className}`}>
      <body>
        <Providers>
          <Navigation />
          <main className="min-h-screen">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
