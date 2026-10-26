import type { Content } from "./types";

// Placeholder content — replace with real experience, projects and links.
export const content: Content = {
  profile: {
    name: "Vikkrant Sharma",
    monogram: "VS",
    role: "Senior Software Engineer · Frontend Architecture · AI-Enabled Products",
    headline: "I build systems, not just screens.",
    summary:
      "Engineering scalable web experiences through thoughtful architecture, precise execution, and a curiosity for what comes next.",
    email: "hello@example.com",
    links: { linkedin: "https://www.linkedin.com/", github: "https://github.com/" },
    resumeUrl: "/resume.pdf",
  },
  experiences: [
    {
      id: "acme",
      company: "Acme Corp",
      role: "Senior Frontend Engineer",
      start: "2021-04",
      end: null,
      achievements: [
        {
          id: "design-system",
          summary: "Led a shared design system adopted by 12 product teams.",
          context: "Teams shipped inconsistent UI with duplicated components.",
          contribution: "Designed the token architecture and component API.",
          decisions: ["Typed variants over free-form props", "Tokens as CSS variables"],
          impact: "Cut UI build time by ~40% across teams.",
          projectSlugs: ["interactive-resume"],
        },
        {
          id: "ai-planning",
          summary: "Built an AI-assisted planning workflow for engineering tickets.",
          context: "Ticket breakdown was slow and inconsistent.",
          contribution: "Prototyped repo-aware planning and shipped it internally.",
          decisions: ["Ground answers in repository context", "Human review before commit"],
          impact: "Planning time per epic dropped from days to hours.",
          projectSlugs: ["planforge-ai"],
        },
      ],
    },
  ],
  projects: [
    {
      slug: "planforge-ai",
      title: "PlanForge AI",
      category: "AI · Developer Productivity",
      problem: "Turns repository context and tickets into actionable engineering plans.",
      role: "Creator",
      tech: ["React", "TypeScript", "Node.js", "RAG"],
      domains: ["AI & Developer Tools"],
      featured: true,
    },
    {
      slug: "git-contributor-stats",
      title: "Git Contributor Stats",
      category: "Open Source · Developer Tooling",
      problem: "A practical view into contribution activity and repository collaboration.",
      role: "Maintainer",
      tech: ["TypeScript", "Node.js"],
      domains: ["Open Source"],
      featured: true,
    },
    {
      slug: "interactive-resume",
      title: "Interactive Resume",
      category: "Personal Product · Web",
      problem: "A living resume that reveals engineering depth through interactive stories.",
      role: "Designer & Engineer",
      tech: ["React", "TypeScript", "TanStack Start"],
      domains: ["Frontend Architecture"],
      featured: true,
    },
  ],
  skills: [
    { name: "React", group: "Frontend" },
    { name: "TypeScript", group: "Frontend" },
    { name: "System design", group: "Architecture" },
    { name: "LLM integration", group: "AI" },
  ],
};
