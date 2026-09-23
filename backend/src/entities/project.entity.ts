import { defineEntity, p } from '@mikro-orm/core';
import { Activity } from './activity.entity.js';
import { User } from './user.entity.js';

export const ProjectSchema = defineEntity({
  name: 'Project',
  properties: {
    id: p.integer().primary(),
    name: p.string(),
    code: p.string().unique(),
    description: p.text().nullable(),
    location: p.string().nullable(),
    isActive: p.boolean().default(true),
    members: () => p.manyToMany(User).mappedBy('projects'),
    activities: () => p.oneToMany(Activity).mappedBy('project'),
    createdAt: p.datetime().onCreate(() => new Date()),
  },
});

export class Project extends ProjectSchema.class {}
ProjectSchema.setClass(Project);
