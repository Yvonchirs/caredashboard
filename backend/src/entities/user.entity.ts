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
    projects: () => p.manyToMany(Project).owner(),
    createdAt: p.datetime().onCreate(() => new Date()),
  },
});

export class User extends UserSchema.class {}
UserSchema.setClass(User);
