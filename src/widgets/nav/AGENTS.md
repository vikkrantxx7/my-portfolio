## Navigation rules

- Profile card charge is a decorative measured SVG with deterministic rounded-perimeter geometry and brightness-only CSS shimmer, keeping content interactive and reduced motion static. Two faint spark lines escape opposite corners (top-left cyan, bottom-right violet), gradient-fading outward with the same deterministic geometry and staggered shimmer.
- Section navigation replaces the hash with automatic scrolling disabled; on mobile, close the menu before measuring the scroll target and restore focus with preventScroll to avoid correction jumps.
- Shared section scrolling treats `top` as document offset zero rather than the hero element, so return-to-top actions also clear scroll progress.
- Desktop sections use Radix `SectionNavigation` and one measured capsule. Bounded SVG lightning joins border centres and dissolves into gradients on actual border arcs, never branches; selection is immediate and reduced motion skips flights. Hold click selection until scroll settles/interruption; rAF tracking uses scroll margins and a near-bottom threshold.
- Mobile dock ignition mounts with the menu: a pointer-transparent masked CSS border sweep, removed on completion; no looping, navigation delay or reduced-motion animation.
- `HeaderEnergy` is container-agnostic: targets come from a `resolveTarget` prop (default `data-energy-target`/`data-energy-shape`); site nav supplies its own resolver.
- The header name block never wraps: it is `shrink-0 whitespace-nowrap`, and the role subheading plus the resume trigger's text label appear only from `lg` up, where the row has room — below that the resume trigger is an icon button whose label stays available to screen readers, and section gaps tighten so nothing collides with the progress ribbon.
