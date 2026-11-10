# Route rules

- Follow the file-based routing conventions in [README.md](README.md); preserve the root shell and do not hand-edit the generated route tree.
- Static sitemap URLs follow required route-level `staticData.sitemap` decisions. Dynamic URLs use the same public content collection as their pages; never invent modification dates.
- Public page identity uses the shared SEO URL helper for both leaf canonical and `og:url` tags, keeping previews from changing search identity and avoiding duplicate root canonicals.
- Social banners use CDN pointers; the favicon is local. Compose Open Graph and Twitter images from `site.url`, never a request-origin function, to avoid Promise URLs.
- Document scroll is restored by the SSR inline script. Skip only the first client restoration callback to avoid overwriting early user scrolling during hydration; retain later navigation and Back/Forward restoration.
- The home route loader resolves synchronously on client navigations; the origin is only needed for SSR head tags.
- Google ownership verification is configured with site identity and rendered in the root SSR head so the published homepage can be verified without client scripts.
- `/blog` filters by `?tag=` and uses the validated blog registry.

These contracts also apply when editing `src/router.tsx` and shared SEO or scroll-restoration helpers.
