import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { cva } from "class-variance-authority";
import { useId, type ReactNode } from "react";
import { Button } from "./button";

const { fieldContext, formContext, useFieldContext, useFormContext } = createFormHookContexts();
const inputVariants = cva("h-11 w-full rounded-md border border-input bg-background px-3 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring");

function TextField({ label, description, type = "text" }: { label: string; description?: string; type?: string }) {
  const field = useFieldContext<string>();
  const id = useId();
  const errors = field.state.meta.errors.map((error) => typeof error === "string" ? error : error?.message).filter(Boolean);
  return <div className="space-y-2">
    <label htmlFor={id} className="text-sm font-medium">{label}</label>
    <input id={id} name={field.name} type={type} className={inputVariants()} value={field.state.value} onBlur={field.handleBlur} onChange={(event) => field.handleChange(event.target.value)} aria-invalid={errors.length > 0} aria-describedby={`${id}-description ${id}-errors`} />
    {description && <p id={`${id}-description`} className="text-sm text-muted-foreground">{description}</p>}
    {errors.length > 0 && <p id={`${id}-errors`} role="alert" className="text-sm text-destructive">{errors.join(" · ")}</p>}
  </div>;
}

function SubmitButton({ children }: { children: ReactNode }) {
  const form = useFormContext();
  return <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
    {([canSubmit, submitting]) => <Button type="submit" disabled={!canSubmit || submitting}>{children}</Button>}
  </form.Subscribe>;
}

export const { useAppForm, withForm } = createFormHook({
  fieldContext, formContext, fieldComponents: { TextField }, formComponents: { SubmitButton },
});