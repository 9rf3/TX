import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
}

export function Input({ label, icon, error, className, ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-medium text-muted-light">{label}</label>}
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">{icon}</div>}
        <input
          className={cn(
            "w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-foreground",
            "placeholder:text-muted transition-all duration-300",
            "focus:outline-none focus:border-primary/50 focus:bg-white/[0.07] focus:shadow-[0_0_20px_rgba(139,92,246,0.15)]",
            icon && "pl-10",
            error && "border-accent-red/50",
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-accent-red">{error}</p>}
    </div>
  );
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function TextArea({ label, className, ...props }: TextAreaProps) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-medium text-muted-light">{label}</label>}
      <textarea
        className={cn(
          "w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-foreground",
          "placeholder:text-muted transition-all duration-300 resize-none",
          "focus:outline-none focus:border-primary/50 focus:bg-white/[0.07] focus:shadow-[0_0_20px_rgba(139,92,246,0.15)]",
          className
        )}
        {...props}
      />
    </div>
  );
}
