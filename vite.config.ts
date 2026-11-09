// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths
//     (replaced below by Vite's native resolve.tsconfigPaths),
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import type { ConfigEnv, PluginOption, UserConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import { mdxPlugin } from "./mdx.config.ts";
import { site } from "./src/content/site.ts";

const lovableConfig = defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    // Co-located tests in src/routes are not routes.
    router: { routeFileIgnorePattern: "\\.test\\." },
  },
  vite: {
    server: {
      proxy: {
        "/__l5e": {
          target: site.url,
          changeOrigin: true,
        },
      },
    },
    plugins: [
      mdxPlugin(),
      VitePWA({
        strategies: "generateSW",
        registerType: "autoUpdate",
        injectRegister: null,
        manifest: false,
        filename: "sw.js",
        outDir: "dist/client",
        devOptions: { enabled: false },
        workbox: {
          globPatterns: ["**/*.{js,css,woff2,png,jpg,svg,pdf,webp}"],
          navigateFallback: null,
          cleanupOutdatedCaches: true,
          skipWaiting: true,
          clientsClaim: true,
          runtimeCaching: [
            {
              // The resume PDF is precached and shown in the in-app viewer; a raw
              // navigation to it must never be served the offline page fallback.
              urlPattern: ({ request, url }) =>
                request.mode === "navigate" &&
                !url.pathname.startsWith("/~oauth") &&
                url.pathname !== "/resume.pdf",
              handler: "NetworkFirst",
              options: { cacheName: "pages", networkTimeoutSeconds: 4 },
            },
            {
              urlPattern: ({ url, sameOrigin }) =>
                sameOrigin && url.pathname.startsWith("/assets/"),
              handler: "CacheFirst",
              options: { cacheName: "assets", expiration: { maxEntries: 120 } },
            },
            {
              urlPattern: ({ url }) => url.hostname === "avatars.githubusercontent.com",
              handler: "StaleWhileRevalidate",
              options: { cacheName: "avatar" },
            },
          ],
        },
      }),
    ],
  },
});

// Lovable's preset always adds vite-tsconfig-paths; swap it for Vite's native resolver.
function withoutTsconfigPathsPlugin(plugins: PluginOption[] | undefined): PluginOption[] {
  return (plugins ?? []).flatMap((plugin) => {
    if (Array.isArray(plugin)) return [withoutTsconfigPathsPlugin(plugin)];
    if (plugin && typeof plugin === "object" && "name" in plugin) {
      return plugin.name === "vite-tsconfig-paths" ? [] : [plugin];
    }
    return [plugin];
  });
}

export default async (env: ConfigEnv): Promise<UserConfig> => {
  const config = await lovableConfig(env);
  return {
    ...config,
    plugins: withoutTsconfigPathsPlugin(config.plugins),
    resolve: { ...config.resolve, tsconfigPaths: true },
  };
};
