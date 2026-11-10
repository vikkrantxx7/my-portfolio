# Functional guide

This guide describes the behavior visitors can use. The home page is the main portfolio surface; project and article pages provide deeper, shareable views of selected content.

## Routes and pages

| Route             | Purpose                 | Main behavior                                                                                    |
| ----------------- | ----------------------- | ------------------------------------------------------------------------------------------------ |
| `/`               | Portfolio home          | Profile, snapshot, selected work, career history, engineering lab, and contact                   |
| `/projects/:slug` | Project case study      | Detailed project content, architecture diagram, cited sources, and project-to-project navigation |
| `/blog`           | Article index           | Lists registered articles and filters them by the `tag` query parameter                          |
| `/blog/:slug`     | Article                 | Renders one registered MDX article with date, reading time, tags, cover, and share metadata      |
| `/sitemap.xml`    | Search-engine discovery | Lists eligible static routes and registered public content pages                                 |

Unknown project or article slugs use the app's not-found view. The root route also supplies a consistent error boundary with a retry action.

## Home page

The home page combines these sections:

1. **Hero and navigation** introduce the profile and offer section navigation, the blog, resume viewer, and theme control.
2. **Snapshot** summarizes strengths, selected metrics, and problem areas.
3. **Selected work** displays featured projects, technology tags, and links to case studies.
4. **Experience** presents roles newest first, with individually expandable achievements.
5. **Engineering lab** shares experiments and notes; entries can link directly to related timeline achievements.
6. **About and contact** provides an email link, copy-email action, and external LinkedIn/GitHub links.

Project filters are driven by validated `tech` and `domain` URL search parameters. Filtering matches featured projects only. The selected filters remain addressable in the URL, and changing or clearing filters does not reset document scroll or retrigger a preserved achievement hash.

## Navigation and discovery

- The desktop header links to the Work, Experience, and About sections. A compact mobile menu exposes the same destinations plus blog and resume actions.
- Desktop headers on the home, project, and blog pages share the same document-scroll progress ribbon. It appears after scrolling and remains separate from music lighting; mobile reading docks keep their perimeter progress indicator.
- Section changes update the URL hash without adding a browser-history entry and scroll to the selected section.
- The command palette opens with `Ctrl+K` or `⌘K`. It can find home sections, projects, blog articles, and timeline achievements; selecting an item navigates to its page or location.
- Internal page links use TanStack Router for in-app navigation. The app preloads route chunks on link intent.
- Scroll position is restored across route changes and browser Back/Forward navigation. An early hydration restore is skipped because the server-rendered inline script already restores the document.

## Achievement links

Each achievement has a stable hash in the form `#exp-<experienceId>-<achievementId>`. A valid direct link scrolls to the corresponding timeline item and expands it. Unknown or malformed achievement hashes are ignored.

Links from engineering-lab notes use the same destination. On same-page navigation, the timeline trigger is brought into view before the achievement expands to avoid scroll anchoring jumps. URL changes replace the current history entry rather than adding one, so sharing a link does not create extra Back-button steps.

## Project case studies

Project summaries and metadata appear in the gallery and detail pages. The case study presents an overview, architecture, key decisions, implementation notes, results/learnings, and repository-relative evidence sources. Architecture diagrams include a text listing of their connections, so their meaning is not dependent on hover or animation.

Case studies distinguish implemented behavior from plans, unverified results, and measured outcomes. New long-form bodies are MDX files; the page shell, summary, diagrams, citations, and SEO remain part of the shared typed content pipeline. A project can still use the typed-section fallback when it does not have a registered MDX body.

## Blog

The blog index shows registered posts and supports filtering by `?tag=<tag>`. Article pages expose publication date, estimated reading time, tags, a cover image, and rendered MDX content. Selecting an article tag returns to the index with that tag selected.

New posts are added to the registry in `src/content/blog.ts`; MDX frontmatter provides the visible metadata. Posts are ordered newest first, and the same registry feeds the index, article routes, command palette, and sitemap.

## Resume viewer

The resume opens in a full-screen in-app dialog rather than navigating away to a raw PDF. The HTML resume is preferred when configured; if it is absent or fails, the viewer falls back to the PDF on larger screens and page images on mobile. The controls include return-to-portfolio, PDF download, and a paper/dark viewing mode independent of the site's theme. When the PDF/image fallback is active on mobile, pinch/double-tap and buttons support zoom.

## Audio player

A floating audio player sits in the header beside the theme toggle on every page, and playback continues across in-app navigation. Tapping the cover artwork plays or pauses the track; the song is not downloaded until the first tap. The player shows the track title, a progress ring, and cyan-to-purple radial waveform bars surrounding the artwork. Bars react to audio while playing and rest short and dim when paused; reduced-motion preferences keep the waveform static. The player announces loading, playing, paused, and error states to assistive technology. If loading fails, tapping the artwork retries. When a music video is configured, right-click, long-press, or `Shift+F10` on the artwork opens it in a popup.

While music plays, its audio analysis brightens a stationary cyan-to-violet shimmer along the desktop header's lower edge or adds a focused halo around the mobile navigation capsule. The edge shimmer follows music intensity without travelling across the header. Lighting fades when playback pauses or ends; reduced-motion preferences suppress the mobile activation ripple.

Once the song duration is available, drag the progress head around the ring with a mouse or touch to seek without toggling playback. The head is also a keyboard-accessible slider: arrow keys adjust progress, and Home/End jump to the beginning/end.

The video popup blurs the background and locks page scrolling until closed. A cyan-to-purple animated frame surrounds the video, with motion disabled for reduced-motion preferences. Its rounded, frosted-glass control bar provides play/pause, elapsed and total time, a cyan-to-purple seek track, mute, volume, and fullscreen when supported. Controls appear on desktop hover or keyboard focus; tapping the video on touch devices toggles them. Controls are keyboard accessible; playback failures display a status message. Mobile fullscreen may use the system player. Opening the video pauses the song; closing pauses the video and retains its position. No download control is provided, and the video context menu is suppressed, but this does not prevent saving the public video through browser tools.

## Theme and accessibility

Dark mode is the default. The selected light/dark theme is saved in browser storage and applied by an inline pre-paint script to reduce theme flash. The toggle updates browser chrome color where supported and uses a view-transition effect only when available and motion is not reduced.

Motion effects respect the user's reduced-motion preference. Project artwork and the audio cover image have descriptive alternative text. Interactive controls provide accessible labels and keyboard focus behavior; the mobile menu traps focus while open and closes with Escape.

## Offline behavior

In a published production context, the generated service worker caches build assets and uses network-first handling for eligible navigations, cache-first handling for same-origin assets, and stale-while-revalidate for GitHub avatar images. It is not registered during development, inside iframes, on known Lovable preview hosts, or when `?sw=off` is present. A stale app worker is unregistered in those excluded contexts.

The worker does not provide a generic offline navigation fallback; offline behavior is limited to resources covered by the configured caches.
