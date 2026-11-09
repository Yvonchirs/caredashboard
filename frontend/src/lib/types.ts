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
  /** Always true for admins. */
  canPostNotices: boolean;
  /** May see who is working where by name. Always true for admins. */
  canSeeWorkStatus: boolean;
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

export interface ActivityPhoto {
  id: number;
  url: string;
  caption: string | null;
}

export interface Activity {
  id: number;
  title: string;
  description: string | null;
  date: string;
  /** Same as `date` for single-day activities. */
  endDate: string;
  startTime: string | null;
  endTime: string | null;
  location: string;
  status: ActivityStatus;
  project: ProjectRef;
  author: StaffRef;
  collaborators: StaffRef[];
  photos: ActivityPhoto[];
  outcome: string | null;
  createdAt: string;
}

export type NoticeKind = "deadline" | "announcement";
export type NoticeRecurrence = "weekly" | "monthly" | "month-end" | "mid-and-month-end" | "quarterly" | "yearly";

export const RECURRENCE_LABELS: Record<NoticeRecurrence, string> = {
  weekly: "Repeats weekly",
  monthly: "Repeats monthly",
  "month-end": "Repeats on the last day of each month",
  "mid-and-month-end": "Repeats on the 15th and last day of each month",
  quarterly: "Repeats quarterly",
  yearly: "Repeats yearly",
};

export interface Notice {
  id: number;
  kind: NoticeKind;
  title: string;
  details: string | null;
  /** For recurring deadlines, the date of this occurrence. */
  date: string;
  time: string | null;
  recurrence: NoticeRecurrence | null;
  recurUntil: string | null;
  author: StaffRef;
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

export type WorkStatus = "office" | "home" | "field" | "leave";

export const WORK_STATUS_LABELS: Record<WorkStatus, string> = {
  office: "Office",
  home: "Home",
  field: "On field",
  leave: "On leave",
};

export interface WorkStatusCounts {
  date: string;
  office: number;
  home: number;
  field: number;
  leave: number;
  notSet: number;
}

export interface WorkStatusPerson {
  id: number;
  name: string;
  jobTitle: string | null;
  status: WorkStatus | null;
}

export interface MyWorkStatusDay {
  date: string;
  status: WorkStatus | null;
}
