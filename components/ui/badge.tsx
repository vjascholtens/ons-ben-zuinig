import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, variant = "default", ...props }: HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "secondary" | "outline" | "destructive";
}) {
  const variants = {
    default: "border-transparent bg-black text-white",
    secondary: "border-transparent bg-neutral-100 text-neutral-800",
    outline: "border-neutral-300 text-neutral-800",
    destructive: "border-transparent bg-red-700 text-white",
  };
  return <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold", variants[variant], className)} {...props} />;
}
