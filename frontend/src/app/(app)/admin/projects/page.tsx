import type { Metadata } from "next";
import { Badge, PageHeader } from "@/components/ui";
import { api } from "@/lib/api";
import { requireAdmin } from "@/lib/session";
import type { Project } from "@/lib/types";
import { NewProjectButton, ProjectActions } from "./project-dialogs";

export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsPage() {
  await requireAdmin();
  const projects = await api<Project[]>("/projects");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administration"
        title="Projects"
        description="Projects appear on the board when staff log activities under them. Archived projects are hidden."
        actions={<NewProjectButton />}
      />

      <div className="overflow-x-auto rounded-md border border-line bg-surface">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b-2 border-ink text-xs tracking-wide text-ink uppercase">
            <tr>
              <th scope="col" className="px-5 py-3.5 font-black">Project</th>
              <th scope="col" className="px-5 py-3.5 font-black">Location</th>
              <th scope="col" className="px-5 py-3.5 font-black">Staff</th>
              <th scope="col" className="px-5 py-3.5 font-black">Status</th>
              <th scope="col" className="px-5 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {projects.map((project) => (
              <tr key={project.id} className={project.isActive ? undefined : "text-ink-subtle"}>
                <td className="px-5 py-3.5">
                  <p className="font-bold text-ink">{project.name}</p>
                  <p className="text-xs text-ink-subtle">{project.code}</p>
                </td>
                <td className="px-5 py-3.5 text-ink-muted">{project.location ?? "—"}</td>
                <td className="px-5 py-3.5 tabular">{project.memberCount}</td>
                <td className="px-5 py-3.5">
                  {project.isActive ? <Badge tone="success">Active</Badge> : <Badge>Archived</Badge>}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <ProjectActions project={project} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {projects.length === 0 && <p className="px-5 py-10 text-center text-sm text-ink-muted">No projects yet.</p>}
      </div>
    </div>
  );
}
