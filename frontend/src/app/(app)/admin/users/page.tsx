import type { Metadata } from "next";
import { Badge, PageHeader } from "@/components/ui";
import { api } from "@/lib/api";
import { requireAdmin } from "@/lib/session";
import type { Project, User } from "@/lib/types";
import { NewUserButton, UserActions } from "./user-dialogs";

export const metadata: Metadata = { title: "Users" };

export default async function UsersPage() {
  const admin = await requireAdmin();
  const [users, projects] = await Promise.all([api<User[]>("/users"), api<Project[]>("/projects")]);
  const activeProjects = projects.filter((project) => project.isActive);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administration"
        title="Users"
        description="Create accounts, choose which projects each person can log activities for, and manage access."
        actions={<NewUserButton projects={activeProjects} />}
      />

      <div className="overflow-x-auto rounded-md border border-line bg-surface">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b-2 border-ink text-xs tracking-wide text-ink uppercase">
            <tr>
              <th scope="col" className="px-5 py-3.5 font-black">Name</th>
              <th scope="col" className="px-5 py-3.5 font-black">Role</th>
              <th scope="col" className="px-5 py-3.5 font-black">Project access</th>
              <th scope="col" className="px-5 py-3.5 font-black">Status</th>
              <th scope="col" className="px-5 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.map((user) => (
              <tr key={user.id} className={user.isActive ? undefined : "text-ink-subtle"}>
                <td className="px-5 py-3.5">
                  <p className="font-bold text-ink">
                    {user.name}
                    {user.id === admin.id && <span className="font-normal text-ink-subtle"> (you)</span>}
                  </p>
                  <p className="text-xs text-ink-subtle">
                    {user.email}
                    {user.jobTitle && ` · ${user.jobTitle}`}
                  </p>
                </td>
                <td className="px-5 py-3.5">
                  {user.role === "admin" ? <Badge tone="brand">Admin</Badge> : <Badge>Staff</Badge>}
                </td>
                <td className="px-5 py-3.5">
                  {user.role === "admin" ? (
                    <span className="text-xs text-ink-subtle">All projects</span>
                  ) : user.projects.length ? (
                    <div className="flex flex-wrap gap-1">
                      {user.projects.map((project) => (
                        <Badge key={project.id} title={project.name}>
                          {project.code}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-danger">None assigned</span>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  {!user.isActive ? (
                    <Badge tone="danger">Deactivated</Badge>
                  ) : user.mustChangePassword ? (
                    <Badge tone="brand">Pending first sign-in</Badge>
                  ) : (
                    <Badge tone="success">Active</Badge>
                  )}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <UserActions user={user} projects={activeProjects} isSelf={user.id === admin.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
