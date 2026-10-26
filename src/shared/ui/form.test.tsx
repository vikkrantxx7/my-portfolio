import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { useAppForm } from "./form";

function Example({ submit }: { submit: (value: string) => void }) {
  const form = useAppForm({
    defaultValues: { name: "" },
    onSubmit: ({ value }) => submit(value.name),
  });
  return <form onSubmit={(event) => { event.preventDefault(); void form.handleSubmit(); }}>
    <form.AppField name="name" validators={{ onChange: ({ value }) => value ? undefined : "Name is required" }}>
      {(field) => <field.TextField label="Name" />}
    </form.AppField>
    <form.AppForm><form.SubmitButton>Save</form.SubmitButton></form.AppForm>
  </form>;
}

describe("TanStack Form primitives", () => {
  it("submits the field value through TanStack Form", async () => {
    const submit = vi.fn();
    render(<Example submit={submit} />);
    const user = userEvent.setup();
    await user.type(screen.getByRole("textbox", { name: "Name" }), "Vikrant");
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(submit).toHaveBeenCalledWith("Vikrant");
  });
  it("invalid values block submission and recover after correction", async () => {
    const submit = vi.fn();
    render(<Example submit={submit} />);
    const user = userEvent.setup();
    const input = screen.getByRole("textbox", { name: "Name" });
    await user.type(input, "x");
    await user.clear(input);
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
    expect(submit).not.toHaveBeenCalled();
    await user.type(input, "Vikrant");
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(submit).toHaveBeenCalledWith("Vikrant");
  });
});