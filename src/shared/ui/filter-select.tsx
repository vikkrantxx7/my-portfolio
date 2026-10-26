import { cva } from "class-variance-authority";

const selectVariants = cva(
  "h-11 w-full min-w-0 rounded-md border border-border bg-card px-3 font-mono text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
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
    </label>
  );
}
