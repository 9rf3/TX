"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Menu, X, User } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#platform", label: "Platform" },
  { href: "#ai", label: "AI" },
  { href: "#community", label: "Community" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, profile } = useAuth();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-[#0a0a0f]/80 backdrop-blur-2xl border-b border-white/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#06b6d4] flex items-center justify-center group-hover:shadow-[0_0_25px_rgba(139,92,246,0.4)] transition-shadow duration-300">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                TWO<span className="text-[#8b5cf6]">KAX</span>
              </span>
            </Link>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href}
                  className="px-4 py-2 text-sm text-[#94a3b8] hover:text-white rounded-xl hover:bg-white/[0.04] transition-all duration-200">
                  {link.label}
                </a>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <Link href="/dashboard"
                    className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-[#94a3b8] hover:text-white transition-colors">
                    Dashboard
                  </Link>
                  <Link href="/profile"
                    className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-white/10 rounded-xl hover:bg-white/20 transition-all duration-300">
                    <User className="w-4 h-4" />
                    {profile?.full_name?.split(' ')[0] || "Account"}
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login"
                    className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-[#94a3b8] hover:text-white transition-colors">
                    Log In
                  </Link>
                  <Link href="/register"
                    className="hidden sm:inline-flex px-5 py-2.5 text-sm font-semibold text-white bg-[#8b5cf6] rounded-xl hover:bg-[#7c3aed] hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-all duration-300">
                    Get Started Free
                  </Link>
                </>
              )}
              <button onClick={() => setMobileOpen(true)}
                className="md:hidden p-2 text-[#94a3b8] hover:text-white rounded-xl hover:bg-white/5 cursor-pointer">
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => setMobileOpen(false)} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed right-0 top-0 bottom-0 w-[280px] bg-[#12121a] border-l border-white/[0.06] z-50 p-6">
              <button onClick={() => setMobileOpen(false)} className="absolute top-5 right-5 text-[#94a3b8] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
              <div className="mt-12 space-y-1">
                {navLinks.map((link) => (
                  <a key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 text-sm text-[#94a3b8] hover:text-white rounded-xl hover:bg-white/5 transition-all">
                    {link.label}
                  </a>
                ))}
                <div className="pt-4 space-y-3">
                  {user ? (
                    <>
                      <Link href="/dashboard" className="block px-4 py-3 text-sm text-center text-white/70 border border-white/10 rounded-xl">Dashboard</Link>
                      <Link href="/profile" className="block px-4 py-3 text-sm text-center text-white font-semibold bg-white/10 rounded-xl">Account</Link>
                    </>
                  ) : (
                    <>
                      <Link href="/login" className="block px-4 py-3 text-sm text-center text-white/70 border border-white/10 rounded-xl">Log In</Link>
                      <Link href="/register" className="block px-4 py-3 text-sm text-center text-white font-semibold bg-[#8b5cf6] rounded-xl">Get Started Free</Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
