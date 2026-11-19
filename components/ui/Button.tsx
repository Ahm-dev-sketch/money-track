"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

type Variant = "primary" | "onPrimary" | "onPrimarySoft" | "secondary" | "ghost" | "danger" | "income";
type Size = "sm" | "md" | "lg" | "icon";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold select-none " +
  "transition-[background-color,color,border-color,transform,opacity] duration-150 " +
  "active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 " +
  "focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-on-primary hover:opacity-95 shadow-sm active:opacity-90",
  onPrimary: "bg-white text-[#0c382e] hover:bg-white/95 shadow-sm",
  onPrimarySoft: "border border-white/20 bg-white/10 text-white hover:bg-white/15",
  secondary: "border border-line/90 bg-surface text-text hover:bg-surface-2 shadow-sm",
  ghost: "text-text-muted hover:text-text hover:bg-surface-2",
  danger: "bg-expense text-white hover:bg-expense/90 shadow-sm",
  income: "bg-income text-white hover:bg-income/90 shadow-sm",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[12.5px]",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-[15px]",
  icon: "h-10 w-10 shrink-0",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", leftIcon, rightIcon, fullWidth, className = "", children, type = "button", ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...rest}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  );
});
