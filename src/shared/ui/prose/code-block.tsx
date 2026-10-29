import { Check, Copy } from "lucide-react";
import { type ComponentProps, useEffect, useRef, useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/ui/button";

export function CodeBlock({ children, className, ...props }: ComponentProps<"pre">) {
  const preRef = useRef<HTMLPreElement>(null);
  const resetRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  useEffect(() => () => clearTimeout(resetRef.current), []);
  const label =
    status === "copied" ? "Copied" : status === "failed" ? "Copy failed — retry" : "Copy code";

  async function copy() {
    const code = preRef.current?.querySelector("code");
    if (!code) return;
    const lines = Array.from(code.querySelectorAll("[data-line]"));
    const text = lines.length
      ? lines.map((line) => line.textContent ?? "").join("\n")
      : (code.textContent ?? "");
    clearTimeout(resetRef.current);
    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
    resetRef.current = setTimeout(() => setStatus("idle"), 2000);
  }

  return (
    <div className="relative min-w-0" data-code-block="">
      <pre
        {...props}
        ref={preRef}
        className={cn(
          "overflow-x-auto rounded-lg border border-border bg-card p-4 pr-16 font-mono text-sm",
          className,
        )}
      >
        {children}
      </pre>
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-2 size-8 bg-card p-0 text-muted-foreground"
              aria-label={label}
              onClick={copy}
            >
              {status === "copied" ? (
                <Check className="size-4 text-primary" aria-hidden="true" />
              ) : (
                <Copy className="size-4" aria-hidden="true" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{label}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <span className="sr-only" role="status">
        {status === "idle" ? "" : label}
      </span>
    </div>
  );
}
