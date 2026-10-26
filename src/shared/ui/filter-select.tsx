import * as SelectPrimitive from "@radix-ui/react-select";
import { cva } from "class-variance-authority";
import { Check, ChevronDown } from "lucide-react";

// Radix Select cannot use an empty string as an item value, so the reset
// choice ("All technologies") carries a sentinel and maps back to "".
const ALL_VALUE = "__all__";

const triggerVariants = cva(
  "group flex h-11 w-full min-w-0 cursor-pointer items-center justify-between gap-2 rounded-md border border-border bg-card py-0 pl-3 pr-10 text-left font-mono text-sm text-foreground transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:border-primary/40",
);

const chevronVariants = cva(
  "pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-transform duration-200 group-hover:text-foreground group-focus-visible:text-primary group-data-[state=open]:rotate-180 group-data-[state=open]:text-primary",
);

const contentVariants = cva(
  "z-50 max-h-(--radix-select-content-available-height) min-w-(--radix-select-trigger-width) overflow-y-auto overflow-x-hidden rounded-md border border-primary/20 bg-card/95 p-1 shadow-glow backdrop-blur-xl data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-select-content-transform-origin)",
);

const itemVariants = cva(
  "relative flex w-full cursor-pointer select-none items-center justify-between gap-2 rounded-sm py-2 pl-3 pr-3 font-mono text-sm text-muted-foreground outline-none transition-colors data-[highlighted]:bg-foreground/10 data-[highlighted]:text-foreground data-[state=checked]:text-primary",
);

export function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  const choices = value && !options.includes(value) ? [value, ...options] : options;
  const allLabel = `All ${label === "Technology" ? "technologies" : "domains"}`;
  return (
    <div className="grid min-w-0 gap-2">
      <span className="font-mono text-xs text-muted-foreground">{label}</span>
      <SelectPrimitive.Root
        value={value === "" ? ALL_VALUE : value}
        onValueChange={(next) => onChange(next === ALL_VALUE ? "" : next)}
      >
        <span className="relative block min-w-0">
          <SelectPrimitive.Trigger aria-label={label} className={triggerVariants()}>
            <span className="truncate">
              <SelectPrimitive.Value />
            </span>
            <SelectPrimitive.Icon asChild>
              <ChevronDown aria-hidden className={chevronVariants()} />
            </SelectPrimitive.Icon>
          </SelectPrimitive.Trigger>
        </span>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content position="popper" sideOffset={6} className={contentVariants()}>
            <SelectPrimitive.Viewport>
              <SelectPrimitive.Item value={ALL_VALUE} className={itemVariants()}>
                <SelectPrimitive.ItemText>{allLabel}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator>
                  <Check aria-hidden className="size-4" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
              {choices.map((option) => (
                <SelectPrimitive.Item key={option} value={option} className={itemVariants()}>
                  <SelectPrimitive.ItemText>{option}</SelectPrimitive.ItemText>
                  <SelectPrimitive.ItemIndicator>
                    <Check aria-hidden className="size-4" />
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </div>
  );
}
