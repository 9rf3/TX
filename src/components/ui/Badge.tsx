import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "primary" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({ children, variant = "default", size = "sm", className }: BadgeProps) {
  const variants: Record<string, string> = {
    default: "bg-white/10 text-muted-light",
    primary: "bg-primary/15 text-primary-light border-primary/20",
    success: "bg-accent-green/15 text-accent-green border-accent-green/20",
    warning: "bg-accent-orange/15 text-accent-orange border-accent-orange/20",
    danger: "bg-accent-red/15 text-accent-red border-accent-red/20",
    info: "bg-secondary/15 text-secondary border-secondary/20",
  };
  const sizes: Record<string, string> = { sm: "px-2 py-0.5 text-[10px]", md: "px-3 py-1 text-xs" };

  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full font-medium border border-transparent", variants[variant], sizes[size], className)}>
      {children}
    </span>
  );
}
