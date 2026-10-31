import rehypePrettyCode from "rehype-pretty-code";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";

/**
 * Shared MDX compiler options for the app build, Vitest, and tests.
 * `development` is pinned to false so compiled MDX always imports the stable
 * production JSX runtime (`react/jsx-runtime`). @mdx-js/rollup otherwise
 * defaults the development runtime from Vite's build mode, and a production
 * SSR bundle compiled with the dev runtime crashes because the published
 * React build has no `jsxDEV` export.
 */
export const mdxOptions = {
  development: false,
  providerImportSource: "@mdx-js/react",
  remarkPlugins: [
    remarkFrontmatter,
    remarkGfm,
    [remarkMdxFrontmatter, { name: "frontmatter" }] as const,
  ],
  rehypePlugins: [
    [
      rehypePrettyCode,
      {
        theme: { light: "github-light", dark: "github-dark-dimmed" },
        keepBackground: false,
        defaultLang: { block: "plaintext" },
      },
    ] as const,
  ],
} as const;
