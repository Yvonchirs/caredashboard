import { hasActivityStarted } from './date.util.js';
import type { Activity, Project, User } from '../entities/index.js';

export function serializeUser(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    jobTitle: user.jobTitle ?? null,
    isActive: user.isActive,
    mustChangePassword: user.mustChangePassword,
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
    startTime: activity.startTime ?? null,
    location: activity.location,
    status: activity.status,
    hasStarted: hasActivityStarted(activity.date, activity.startTime ?? null),
    project: serializeProjectRef(activity.project),
    author: serializeStaffRef(activity.author),
    collaborators: activity.collaborators.isInitialized()
      ? activity.collaborators.getItems().map(serializeStaffRef)
      : [],
    photos: activity.photos.isInitialized()
      ? activity.photos.getItems().map((photo) => ({ id: photo.id, url: `/uploads/${photo.filename}` }))
      : [],
    createdAt: activity.createdAt,
  };
}
