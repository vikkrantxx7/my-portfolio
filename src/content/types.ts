export interface Profile {
  name: string;
  monogram: string;
  role: string;
  headline: string;
  summary: string;
  email: string;
  links: { linkedin: string; github: string };
  resumeUrl: string;
}

export interface Achievement {
  id: string;
  summary: string;
  context: string;
  contribution: string;
  decisions: string[];
  impact: string;
  projectSlugs: string[];
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  start: string; // YYYY-MM
  end: string | null;
  achievements: Achievement[];
}

export interface Project {
  slug: string;
  title: string;
  category: string;
  problem: string;
  role: string;
  tech: string[];
  domains: string[];
  featured: boolean;
}

export interface Skill {
  name: string;
  group: string;
}

export interface Stat {
  id: string;
  value: number;
  suffix: string;
  label: string;
}

export interface Snapshot {
  strengths: { title: string; detail: string }[];
  stats: Stat[];
  problemAreas: string[];
}

export interface Content {
  snapshot: Snapshot;
  profile: Profile;
  experiences: Experience[];
  projects: Project[];
  skills: Skill[];
}
