import type { Content } from "./types";
import { prepforgeCaseStudy, gitStatsCaseStudy } from "./case-studies";

// Content sourced from Vikrant's resume. Achievement "decisions" are summarised from it.
export const content: Content = {
  profile: {
    name: "Vikrant Sharma",
    monogram: "VS",
    role: "Lead Fullstack Engineer · Frontend Architecture · AI-Assisted Development",
    headline: "I build systems, not just screens.",
    summary:
      "13 years building web applications across frontend and backend — GraphQL BFFs, micro-frontends, and performance work that ships.",
    email: "sharma.vikkrant@gmail.com",
    links: {
      linkedin: "https://www.linkedin.com/in/vikrant-sharma-001",
      github: "https://github.com/vikkrantxx7",
    },
    resumeUrl: "/resume.pdf",
  },
  snapshot: {
    strengths: [
      {
        title: "Frontend architecture",
        detail: "Micro-frontends, Feature-Sliced Design and design systems that scale with teams.",
      },
      {
        title: "API & BFF design",
        detail: "GraphQL BFFs on Node.js and Fastify that decouple UIs from backend churn.",
      },
      {
        title: "Performance",
        detail: "Bundle, image and caching work measured against Web Vitals.",
      },
      {
        title: "Developer experience",
        detail: "CI health, shared standards and AI-assisted workflows that cut effort.",
      },
    ],
    stats: [
      { id: "years", value: 13, suffix: "+", label: "Years building for the web" },
      { id: "bundle", value: 50, suffix: "%", label: "Smaller JS/CSS bundles" },
      { id: "images", value: 90, suffix: "%", label: "Smaller images" },
      { id: "effort", value: 40, suffix: "%", label: "Less development effort" },
    ],
    problemAreas: [
      "Untangling frontends from many backends",
      "Slow, heavy pages at scale",
      "Inconsistent UI across teams",
      "Fragile builds and pipelines",
    ],
  },
  experiences: [
    {
      id: "adidas",
      company: "adidas",
      role: "Software Engineer II (Manager Band)",
      start: "2021-12",
      end: null,
      achievements: [
        {
          id: "graphql-bff",
          summary: "Designed and built a GraphQL BFF from scratch with Node.js and Fastify.",
          context: "The React frontend depended directly on several backend services.",
          contribution:
            "Designed the schema and resolvers aggregating services into one frontend-optimized API.",
          decisions: ["BFF pattern to decouple frontend from backends", "Fastify for performance"],
          impact: "Simpler data fetching and a frontend decoupled from backend changes.",
          projectSlugs: [],
        },
        {
          id: "micro-frontend",
          summary:
            "Architected a greenfield React micro-frontend with FSD v2 and Module Federation.",
          context: "A new internal product management application needed a scalable structure.",
          contribution:
            "Defined project structure, standards and guidelines; built core journeys and AG Grid data grids.",
          decisions: [
            "Feature-Sliced Design v2",
            "Webpack Module Federation",
            "AG Grid for large datasets",
          ],
          impact: "Architecture adopted by the team; fast grids for large tabular data.",
          projectSlugs: [],
        },
        {
          id: "rspack-optimization",
          summary: "Cut emitted JavaScript and CSS by ~50% and image assets by 90%.",
          context: "Bundles were large and caching was poor.",
          contribution: "Rspack chunk optimization, cache groups and dependency management.",
          decisions: ["Migrate to Rspack", "Cache-group based chunking"],
          impact: "~50% smaller JS/CSS, 90% smaller images, better cache reuse and load times.",
          projectSlugs: [],
        },
        {
          id: "ai-adoption",
          summary: "Drove 100% team adoption of AI-assisted development.",
          context: "Development effort was high on repetitive work.",
          contribution:
            "Introduced SpecKit and GitHub Copilot workflows; presented at the internal AI Hackathon.",
          decisions: ["Spec-driven development with SpecKit", "Copilot in daily workflow"],
          impact: "~40% reduction in development effort.",
          projectSlugs: [],
        },
        {
          id: "quality-gates",
          summary: "Led technical direction as code owner with a 95% test-coverage gate.",
          context: "Quality needed consistent, automated enforcement.",
          contribution:
            "Code reviews with OWASP Top 10 awareness, mentoring, SonarQube and GitHub Actions gates.",
          decisions: ["95% coverage threshold", "Docker + Kubernetes deploys via GitHub Actions"],
          impact: "Reliable build health and shared engineering standards.",
          projectSlugs: [],
        },
      ],
    },
    {
      id: "ukg",
      company: "UKG",
      role: "Lead Software Engineer",
      start: "2019-06",
      end: "2021-11",
      achievements: [
        {
          id: "accessible-saas",
          summary: "Led frontend for a B2B HR, Payroll and Workforce Management platform.",
          context: "Enterprise customers required accessible, consistent interfaces.",
          contribution:
            "Built React interfaces to WebAIM and WAI-ARIA standards; mentored backend engineers on React.",
          decisions: ["Accessibility-first components", "Reusable UI with stakeholders"],
          impact: "Accessible, consistent UI across the application.",
          projectSlugs: [],
        },
        {
          id: "surveyjs",
          summary: "Early adopter of SurveyJS's beta React library.",
          context: "The beta library had bugs and compatibility gaps.",
          contribution: "Identified issues and fed them back directly to the SurveyJS developers.",
          decisions: ["Adopt early, contribute feedback upstream"],
          impact: "Improved the React implementation for everyone.",
          projectSlugs: [],
        },
        {
          id: "webpack-perf",
          summary: "Optimized Webpack and code-splitting; monitored Web Vitals.",
          context: "Bundles and load performance needed attention.",
          contribution: "Profiled bottlenecks and tuned bundling.",
          decisions: ["Route-level code splitting", "Track Web Vitals"],
          impact: "More efficient bundles and faster loads.",
          projectSlugs: [],
        },
      ],
    },
    {
      id: "infosys",
      company: "Infosys",
      role: "Technology Analyst",
      start: "2013-09",
      end: "2019-05",
      achievements: [
        {
          id: "ecommerce",
          summary: "Built a responsive, mobile-first e-commerce web app.",
          context: "Shoppers used both desktop and mobile.",
          contribution:
            "React, Redux, HTML5 and CSS3 with reusable components; Google Maps mini-map.",
          decisions: ["Mobile-first layout", "Redux for state"],
          impact: "Consistent experience across devices.",
          projectSlugs: [],
        },
      ],
    },
  ],
  projects: [
    {
      slug: "prepforge",
      title: "PrepForge",
      category: "Open Source · Interview Prep",
      problem: "A structured interview question bank with topic browsing and question-level progress APIs.",
      role: "Creator",
      tech: ["Next.js", "Fastify", "GraphQL", "PostgreSQL", "Drizzle ORM", "TypeScript"],
      domains: ["Fullstack", "Open Source"],
      featured: true,
      caseStudy: prepforgeCaseStudy,
    },
    {
      slug: "git-contributor-stats",
      title: "git-contributor-stats",
      category: "npm Package · Developer Tooling",
      problem:
        "CLI and library for Git contributor and activity analytics, with charts and reports.",
      role: "Author & Maintainer",
      tech: ["TypeScript", "Node.js", "Commander", "Chart.js", "Vitest", "Biome"],
      domains: ["Developer Tools", "Open Source"],
      featured: true,
      caseStudy: gitStatsCaseStudy,
    },
  ],
  skills: [
    ...["React", "TypeScript", "Tailwind CSS", "AG Grid"].map((name) => ({
      name,
      group: "Frontend",
    })),
    ...["Node.js", "Fastify", "GraphQL", "PostgreSQL", "Drizzle ORM"].map((name) => ({
      name,
      group: "Backend",
    })),
    ...["Micro-frontends", "Module Federation", "Feature-Sliced Design", "BFF"].map((name) => ({
      name,
      group: "Architecture",
    })),
    ...["Rspack", "Webpack", "Web Vitals"].map((name) => ({ name, group: "Performance" })),
    ...["Vitest", "React Testing Library", "MSW", "SonarQube"].map((name) => ({
      name,
      group: "Testing",
    })),
    ...["Docker", "Kubernetes", "GitHub Actions"].map((name) => ({ name, group: "DevOps" })),
    ...["GitHub Copilot", "SpecKit"].map((name) => ({ name, group: "AI" })),
  ],
};
