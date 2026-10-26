import { cva } from "class-variance-authority";
import { ChevronDown } from "lucide-react";

const selectVariants = cva(
  "peer h-11 w-full min-w-0 appearance-none rounded-md border border-border bg-card py-0 pl-3 pr-10 font-mono text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
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
  return (
    <label className="grid min-w-0 gap-2">
      <span className="font-mono text-xs text-muted-foreground">{label}</span>
      <span className="relative block min-w-0">
        <select
          className={selectVariants()}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">All {label === "Technology" ? "technologies" : "domains"}</option>
          {choices.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors peer-hover:text-foreground peer-focus-visible:text-primary"
        />
      </span>
    </label>
  );
}
