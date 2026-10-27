import mdx from "@mdx-js/rollup";
import rehypePrettyCode from "rehype-pretty-code";
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
      remarkPlugins: [
        remarkFrontmatter,
        remarkGfm,
        [remarkMdxFrontmatter, { name: "frontmatter" }],
      ],
      rehypePlugins: [
        [
          rehypePrettyCode,
          {
            theme: { light: "github-light", dark: "github-dark-dimmed" },
            keepBackground: false,
            defaultLang: { block: "plaintext" },
          },
        ],
      ],
    }) as Plugin),
  };
}
