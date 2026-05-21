import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TWOKAX — The Future of Education",
  description: "A futuristic educational platform combining online learning, AI assistant, gamification, and social interaction. Learn like you're playing a game.",
  keywords: ["education", "online learning", "AI", "gamification", "courses"],
};

import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { AuthProvider } from "@/components/providers/AuthProvider";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let initialUser = null;

  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    initialUser = user;
  } catch {
    // Session fetch failed; proceed without initial user.
    // AuthProvider will recover client-side via onAuthStateChange.
  }

  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        <AuthProvider initialUser={initialUser} initialProfile={null}>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
