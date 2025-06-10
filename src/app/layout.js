import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/core/ui/components/header";
import AuthProvider from "@/core/providers/session-provider";

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
      <body className="bg-white dark:bg-gray-900">
        <AuthProvider>
          <Header />
          <main className="min-h-screen pt-16">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
