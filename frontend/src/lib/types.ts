export type UserRole = "admin" | "staff";
export type ActivityStatus = "pending" | "live" | "completed";

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

export interface StaffRef {
  id: number;
  name: string;
  jobTitle: string | null;
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
  status: ActivityStatus;
  hasStarted: boolean;
  project: ProjectRef;
  author: StaffRef;
  collaborators: StaffRef[];
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
