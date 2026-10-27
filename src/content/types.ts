export interface Profile {
  name: string;
  monogram: string;
  avatarUrl?: string;
  role: string;
  /** Short form of role used as the header subheading. */
  title: string;
  headline: string;
  summary: string;
  email: string;
  links: { linkedin: string; github: string };
  resumeUrl: string;
  resumeFileName: string;
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

export interface DiagramNode {
  id: string;
  label: string;
}

export interface Diagram {
  layers: { title: string; nodes: DiagramNode[] }[];
  edges: { from: string; to: string; label: string }[];
}

export interface CaseStudy {
  diagram: Diagram;
  repository: string;
  status: string;
  overview: string;
  architecture: { title: string; detail: string }[];
  decisions: { title: string; detail: string }[];
  implementation: string[];
  results: string[];
  sources: { label: string; path: string }[];
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
  caseStudy: CaseStudy;
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

export interface LabEntry {
  id: string;
  kind: "Experiment" | "Note";
  title: string;
  summary: string;
  tags: string[];
  /** Optional link to a timeline achievement, as "experienceId/achievementId". */
  achievementRef?: string;
}

export interface Content {
  lab: LabEntry[];
  snapshot: Snapshot;
  profile: Profile;
  experiences: Experience[];
  projects: Project[];
  skills: Skill[];
}
