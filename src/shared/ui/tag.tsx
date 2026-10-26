import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const tagVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em]",
  {
    variants: {
      tone: {
        neutral: "border-border text-muted-foreground",
        accent: "border-primary/40 text-primary",
        violet: "border-secondary/40 text-secondary",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export type TagProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof tagVariants>;

export function Tag({ className, tone, ...props }: TagProps) {
  return <span className={cn(tagVariants({ tone }), className)} {...props} />;
}
