import { act, renderHook } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { useActiveSection } from "./use-active-section";

const ids = ["work", "experience", "about"];
let scroll = 0;

beforeEach(() => {
  scroll = 0;
  vi.spyOn(window, "scrollY", "get").mockImplementation(() => scroll);
  document.body.innerHTML = ids.map((id) => `<section id="${id}"></section>`).join("");
  ids.forEach((id, index) => {
    const el = document.getElementById(id);
    if (!el) return;
    vi.spyOn(el, "getBoundingClientRect").mockImplementation(
      () =>
        ({
          top: 500 + index * 1000 - scroll,
        }) as DOMRect,
    );
  });
});

async function moveTo(y: number) {
  await act(async () => {
    scroll = y;
    window.dispatchEvent(new Event("scroll"));
    await new Promise((resolve) => requestAnimationFrame(resolve));
  });
}

it("clears the active section when manually returning above Work", async () => {
  const { result } = renderHook(() => useActiveSection(ids));
  await moveTo(600);
  expect(result.current.active).toBe("work");
  await moveTo(0);
  expect(result.current.active).toBeNull();
});

it("selects About immediately and ignores intermediate sections during click scrolling", async () => {
  const { result } = renderHook(() => useActiveSection(ids));
  act(() => result.current.select("about"));
  expect(result.current.active).toBe("about");
  await moveTo(600);
  expect(result.current.active).toBe("about");
  await moveTo(1600);
  expect(result.current.active).toBe("about");
  await moveTo(2500);
  act(() => window.dispatchEvent(new Event("scrollend")));
  expect(result.current.active).toBe("about");
});

it("clears immediately on name click and stays clear through the return scroll", async () => {
  const { result } = renderHook(() => useActiveSection(ids));
  await moveTo(2600);
  act(() => result.current.select("top"));
  expect(result.current.active).toBeNull();
  await moveTo(600);
  expect(result.current.active).toBeNull();
  await moveTo(0);
  act(() => window.dispatchEvent(new Event("scrollend")));
  expect(result.current.active).toBeNull();
});

it("resumes manual section tracking when the user interrupts click scrolling", async () => {
  const { result } = renderHook(() => useActiveSection(ids));
  act(() => result.current.select("about"));
  await moveTo(600);
  act(() => window.dispatchEvent(new Event("wheel")));
  expect(result.current.active).toBe("work");
});

it("keeps About selected when the document bottom prevents its full alignment", async () => {
  vi.spyOn(document.documentElement, "scrollHeight", "get").mockReturnValue(
    window.innerHeight + 1800,
  );
  const { result } = renderHook(() => useActiveSection(ids));
  act(() => result.current.select("about"));
  await moveTo(1800);
  act(() => window.dispatchEvent(new Event("scrollend")));
  expect(result.current.active).toBe("about");
});
