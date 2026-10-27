import { cva } from "class-variance-authority";

/** Shared bottom toolbar pill used on every page. `fixed` tone stays dark over the white resume. */
export const dockBar = cva(
  "pointer-events-auto flex items-center rounded-full border px-2 backdrop-blur-xl",
  {
    variants: {
      tone: {
        theme: "border-primary/30 bg-background/85",
        fixed: "border-[#62F4E0]/30 bg-[#080A0F]/90 shadow-[0_0_24px_-4px_rgba(98,244,224,0.5)]",
      },
      size: {
        full: "w-full max-w-sm justify-between",
        compact: "w-auto justify-center gap-1",
      },
    },
    defaultVariants: { tone: "theme", size: "full" },
  },
);

export const dockItem = cva(
  "flex min-h-12 min-w-14 touch-manipulation flex-col items-center justify-center gap-1 rounded-full px-2 font-mono text-[10px] uppercase tracking-[0.14em] transition active:scale-95 focus-visible:outline-none focus-visible:ring-2",
  {
    variants: {
      tone: {
        theme: "text-muted-foreground focus-visible:ring-ring",
        fixed: "text-[#9299AA] hover:text-[#62F4E0] focus-visible:ring-[#62F4E0]",
      },
    },
    defaultVariants: { tone: "theme" },
  },
);
