"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LayoutDashboard, BookOpen, Trophy, User, Swords } from "lucide-react";

const items = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/courses", label: "Courses", icon: BookOpen },
  { href: "/skills", label: "Skills", icon: Swords },
  { href: "/leaderboard", label: "Rank", icon: Trophy },
  { href: "/profile", label: "Profile", icon: User },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-surface/90 backdrop-blur-xl border-t border-border">
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} prefetch={true}
              className={cn("flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all relative",
                isActive ? "text-primary-light" : "text-muted"
              )}
            >
              {isActive && (
                <motion.div layoutId="mobile-active"
                  className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
