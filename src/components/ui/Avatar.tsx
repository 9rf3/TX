import { cn } from "@/lib/utils";

interface AvatarProps {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg" | "xl";
  online?: boolean;
  className?: string;
}

export function Avatar({ name, src, size = "md", online, className }: AvatarProps) {
  const sizes: Record<string, string> = {
    sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-14 h-14 text-lg", xl: "w-20 h-20 text-2xl",
  };
  const dotSizes: Record<string, string> = {
    sm: "w-2 h-2", md: "w-2.5 h-2.5", lg: "w-3 h-3", xl: "w-4 h-4",
  };
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const colors = ["from-primary to-secondary", "from-accent-pink to-primary", "from-secondary to-accent-green", "from-accent-orange to-accent-pink"];
  const colorIndex = name.charCodeAt(0) % colors.length;

  return (
    <div className={cn("relative inline-flex shrink-0", className)}>
      <div className={cn("rounded-full flex items-center justify-center font-bold text-white bg-gradient-to-br", colors[colorIndex], sizes[size])}>
        {src ? <img src={src} alt={name} className="w-full h-full rounded-full object-cover" /> : initials}
      </div>
      {online !== undefined && (
        <span className={cn("absolute bottom-0 right-0 rounded-full border-2 border-surface", dotSizes[size], online ? "bg-accent-green" : "bg-muted")} />
      )}
    </div>
  );
}
