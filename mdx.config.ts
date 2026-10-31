import mdx from "@mdx-js/rollup";
import type { Plugin } from "vite";
import { mdxOptions } from "./src/content/mdx-options";

/** Shared MDX compiler for the app and Vitest; runs before the React plugin. */
export function mdxPlugin(): Plugin {
  return {
    enforce: "pre",
    ...(mdx({ ...mdxOptions }) as Plugin),
  };
}
