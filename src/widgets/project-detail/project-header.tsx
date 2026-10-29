import { ThemeToggle } from "@/features/theme-toggle/theme-toggle";
import { PageHeader } from "@/shared/ui/page-header";
import { ProjectBackLink } from "./project-back-link";

export function ProjectHeader() {
  return (
    <PageHeader actions={<ThemeToggle />}>
      <ProjectBackLink />
    </PageHeader>
  );
}
