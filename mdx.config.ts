import mdx from "@mdx-js/rollup";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import type { Plugin } from "vite";

/** Shared MDX compiler for the app and Vitest; runs before the React plugin. */
export function mdxPlugin(): Plugin {
  return {
    enforce: "pre",
    ...(mdx({
      providerImportSource: "@mdx-js/react",
      remarkPlugins: [remarkFrontmatter, remarkGfm, [remarkMdxFrontmatter, { name: "frontmatter" }]],
    }) as Plugin),
  };
}
