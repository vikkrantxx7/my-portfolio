import { describe, expect, it, vi } from "vitest";
import { watchForUpdates } from "./register-sw";

describe("watchForUpdates", () => {
  it("checks for a new version when the app returns to the foreground", () => {
    const reg = { update: vi.fn().mockResolvedValue(undefined) };
    const doc = new EventTarget() as EventTarget & { visibilityState: string };
    doc.visibilityState = "visible";
    const sw = new EventTarget();
    watchForUpdates(reg, { doc, sw, reload: vi.fn(), hadController: true });
    doc.dispatchEvent(new Event("visibilitychange"));
    expect(reg.update).toHaveBeenCalledTimes(1);
  });

  it("reloads once when a new version takes over an existing app", () => {
    const reload = vi.fn();
    const sw = new EventTarget();
    watchForUpdates({ update: vi.fn() }, { doc: new EventTarget() as never, sw, reload, hadController: true });
    sw.dispatchEvent(new Event("controllerchange"));
    sw.dispatchEvent(new Event("controllerchange"));
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("does not reload on the very first install", () => {
    const reload = vi.fn();
    const sw = new EventTarget();
    watchForUpdates({ update: vi.fn() }, { doc: new EventTarget() as never, sw, reload, hadController: false });
    sw.dispatchEvent(new Event("controllerchange"));
    expect(reload).not.toHaveBeenCalled();
  });
});
