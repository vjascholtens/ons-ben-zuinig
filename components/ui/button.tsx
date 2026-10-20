import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "outline" | "destructive" | "ghost" };
const variants = { default: "bg-black text-white hover:bg-neutral-800", outline: "border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-100", destructive: "bg-red-700 text-white hover:bg-red-800", ghost: "text-neutral-900 hover:bg-neutral-100" };
export function Button({ className, variant = "default", ...props }: ButtonProps) { return <button className={cn("inline-flex min-h-9 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50", variants[variant], className)} {...props} />; }
