import mdx from "@mdx-js/rollup";
import rehypePrettyCode from "rehype-pretty-code";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import type { Plugin } from "vite";

/**
 * Shared MDX compiler options for the app and Vitest.
 * `development` is pinned to false so compiled MDX always imports the stable
 * production JSX runtime (`react/jsx-runtime`). @mdx-js/rollup otherwise
 * defaults to the development runtime based on Vite's build mode, and a
 * production SSR bundle compiled with the dev runtime crashes because the
 * published React build has no `jsxDEV` export.
 */
export const mdxOptions = {
  development: false,
  providerImportSource: "@mdx-js/react",
  remarkPlugins: [
    remarkFrontmatter,
    remarkGfm,
    [remarkMdxFrontmatter, { name: "frontmatter" }],
  ] as const,
  rehypePlugins: [
    [
      rehypePrettyCode,
      {
        theme: { light: "github-light", dark: "github-dark-dimmed" },
        keepBackground: false,
        defaultLang: { block: "plaintext" },
      },
    ],
  ] as const,
};

/** Shared MDX compiler for the app and Vitest; runs before the React plugin. */
export function mdxPlugin(): Plugin {
  return {
    enforce: "pre",
    ...(mdx({ ...mdxOptions }) as Plugin),
  };
}
