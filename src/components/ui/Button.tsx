"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ButtonProps {
  variant?: "primary" | "ghost" | "danger" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  glow?: boolean;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  style?: React.CSSProperties;
  onClick?: () => void;
}

export function Button({ variant = "primary", size = "md", glow = false, className, children, disabled, type = "button", style, onClick }: ButtonProps) {
  const base = "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  const variants: Record<string, string> = {
    primary: "bg-primary text-white hover:bg-primary-dark hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] active:scale-95",
    ghost: "bg-white/5 text-foreground hover:bg-white/10 border border-white/10 hover:border-white/20",
    danger: "bg-accent-red/10 text-accent-red hover:bg-accent-red/20 border border-accent-red/20",
    secondary: "bg-secondary/10 text-secondary hover:bg-secondary/20 border border-secondary/20",
    outline: "bg-transparent text-foreground border border-white/20 hover:bg-white/5 hover:border-primary/50",
  };
  const sizes: Record<string, string> = {
    sm: "px-3 py-1.5 text-xs", md: "px-5 py-2.5 text-sm", lg: "px-7 py-3.5 text-base",
  };

  return (
    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
      type={type} disabled={disabled} onClick={onClick} style={style}
      className={cn(base, variants[variant], sizes[size], glow && "animate-pulse-glow", className)}>
      {children}
    </motion.button>
  );
}
