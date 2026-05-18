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
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { data: { user } } = await supabase.auth.getUser();
  let profile = null;
  
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        <AuthProvider initialUser={user} initialProfile={profile}>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
