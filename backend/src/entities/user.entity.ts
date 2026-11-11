import { defineEntity, p } from '@mikro-orm/core';
import { Project } from './project.entity.js';

export const USER_ROLES = ['admin', 'staff'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const UserSchema = defineEntity({
  name: 'User',
  properties: {
    id: p.integer().primary(),
    name: p.string(),
    email: p.string().unique(),
    passwordHash: p.string().hidden(),
    role: p.enum(USER_ROLES).default('staff'),
    jobTitle: p.string().nullable(),
    isActive: p.boolean().default(true),
    mustChangePassword: p.boolean().default(false),
    /** Lets staff post deadlines and announcements on the board; admins always can. */
    canPostNotices: p.boolean().default(false),
    /** Lets staff see who is working where (names, not just counts); admins always can. */
    canSeeWorkStatus: p.boolean().default(false),
    /** SHA-256 of the emailed set/reset-password token; the token itself is never stored. */
    resetTokenHash: p.string().nullable().hidden(),
    resetTokenExpiresAt: p.datetime().nullable().hidden(),
    /** Lifetime the current token was issued with, used to throttle repeat requests. */
    resetTokenHours: p.integer().nullable().hidden(),
    projects: () => p.manyToMany(Project).owner(),
    createdAt: p.datetime().onCreate(() => new Date()),
  },
});

export class User extends UserSchema.class {}
UserSchema.setClass(User);
