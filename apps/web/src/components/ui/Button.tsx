"use client";
import { type ButtonHTMLAttributes, type ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading,
  fullWidth,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses = "inline-flex items-center justify-center gap-2 font-medium select-none disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 rounded-xl";

  const variantClasses = {
    primary: "bg-emerald-500 text-slate-950 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20",
    secondary: "bg-slate-900/50 text-slate-200 border border-slate-800 hover:bg-slate-900/70 hover:border-slate-700",
    ghost: "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50",
    danger: "bg-red-600/10 text-red-400 border border-red-600/20 hover:bg-red-600/20",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {loading && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full anim-spin opacity-60" />}
      {children}
    </button>
  );
}
