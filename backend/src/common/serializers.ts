import { computeActivityStatus } from './date.util.js';
import type { Activity, Notice, Project, User } from '../entities/index.js';

export function serializeUser(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    jobTitle: user.jobTitle ?? null,
    isActive: user.isActive,
    mustChangePassword: user.mustChangePassword,
    canPostNotices: user.role === 'admin' || user.canPostNotices,
    projects: user.projects.isInitialized()
      ? user.projects.getItems().map((p) => ({ id: p.id, name: p.name, code: p.code }))
      : [],
    createdAt: user.createdAt,
  };
}

export function serializeProjectRef(project: Project) {
  return { id: project.id, name: project.name, code: project.code };
}

export function serializeStaffRef(user: User) {
  return { id: user.id, name: user.name, jobTitle: user.jobTitle ?? null };
}

export function serializeActivity(activity: Activity) {
  return {
    id: activity.id,
    title: activity.title,
    description: activity.description ?? null,
    date: activity.date,
    endDate: activity.endDate ?? activity.date,
    startTime: activity.startTime ?? null,
    endTime: activity.endTime ?? null,
    location: activity.location,
    status: computeActivityStatus(activity),
    project: serializeProjectRef(activity.project),
    author: serializeStaffRef(activity.author),
    collaborators: activity.collaborators.isInitialized()
      ? activity.collaborators.getItems().map(serializeStaffRef)
      : [],
    photos: activity.photos.isInitialized()
      ? activity.photos.getItems().map((photo) => ({ id: photo.id, url: `/uploads/${photo.filename}`, caption: photo.caption ?? null }))
      : [],
    outcome: activity.outcome ?? null,
    createdAt: activity.createdAt,
  };
}

/** `date` overrides the stored date with a specific occurrence of a recurring deadline. */
export function serializeNotice(notice: Notice, date = notice.date) {
  return {
    id: notice.id,
    kind: notice.kind,
    title: notice.title,
    details: notice.details ?? null,
    date,
    time: notice.time ?? null,
    recurrence: notice.recurrence ?? null,
    recurUntil: notice.recurUntil ?? null,
    author: serializeStaffRef(notice.author),
    createdAt: notice.createdAt,
  };
}
