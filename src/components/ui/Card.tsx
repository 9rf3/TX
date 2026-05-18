"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  gradient?: string;
  onClick?: () => void;
  animate?: boolean;
}

export function Card({ children, className, hover = true, glow = false, gradient, onClick, animate = true }: CardProps) {
  const Wrapper = animate ? motion.div : "div";
  const animateProps = animate ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 },
    whileHover: hover ? { y: -4, transition: { duration: 0.2 } } : undefined,
  } : {};

  return (
    <Wrapper
      className={cn(
        "rounded-2xl p-5 transition-all duration-300",
        "bg-surface border border-border",
        hover && "hover:border-border-light hover:bg-surface-light cursor-pointer",
        glow && "neon-glow",
        onClick && "cursor-pointer",
        className
      )}
      style={gradient ? { background: gradient } : undefined}
      onClick={onClick}
      {...animateProps}
    >
      {children}
    </Wrapper>
  );
}

export function GlassCard({ children, className, ...props }: CardProps) {
  return (
    <Card className={cn("glass glass-hover", className)} {...props}>
      {children}
    </Card>
  );
}
