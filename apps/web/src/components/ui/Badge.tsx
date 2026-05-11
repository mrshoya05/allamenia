import { type ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "violet" | "green" | "red";
}

export function Badge({ children, variant = "default" }: BadgeProps) {
  const variantClasses = {
    default: "bg-slate-900/50 text-slate-400 border-slate-800",
    violet: "bg-emerald-500/10 text-emerald-500 border-emerald-500/15",
    green: "bg-green-600/10 text-green-400 border-green-600/15",
    red: "bg-red-600/10 text-red-400 border-red-600/15",
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium backdrop-blur-sm border rounded-xl ${variantClasses[variant]}`}>
      {children}
    </span>
  );
}
