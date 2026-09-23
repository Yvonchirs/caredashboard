export type UserRole = "admin" | "staff";

export interface ProjectRef {
  id: number;
  name: string;
  code: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  jobTitle: string | null;
  isActive: boolean;
  mustChangePassword: boolean;
  projects: ProjectRef[];
  createdAt: string;
}

export interface Project extends ProjectRef {
  description: string | null;
  location: string | null;
  isActive: boolean;
  memberCount: number;
  createdAt: string;
}

export interface Activity {
  id: number;
  title: string;
  description: string | null;
  date: string;
  startTime: string | null;
  location: string;
  project: ProjectRef;
  author: { id: number; name: string; jobTitle: string | null };
  photos: { id: number; url: string }[];
  createdAt: string;
}

export interface DashboardProject extends ProjectRef {
  location: string | null;
  activities: Activity[];
}

export interface Dashboard {
  from: string;
  to: string;
  stats: { activities: number; projects: number; staff: number; locations: number };
  projects: DashboardProject[];
}

export type FormState = { error?: string; success?: string; secret?: string } | undefined;
