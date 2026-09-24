import { defineEntity, p } from '@mikro-orm/core';
import { Photo } from './photo.entity.js';
import { Project } from './project.entity.js';
import { User } from './user.entity.js';

export const ACTIVITY_STATUSES = ['pending', 'live', 'completed'] as const;
export type ActivityStatus = (typeof ACTIVITY_STATUSES)[number];
// Status is not stored: it is derived from date/startTime, see common/date.util.ts#computeActivityStatus.

export const ActivitySchema = defineEntity({
  name: 'Activity',
  properties: {
    id: p.integer().primary(),
    title: p.string(),
    description: p.text().nullable(),
    /** Calendar day in YYYY-MM-DD form. */
    date: p.string().length(10).index(),
    startTime: p.string().length(5).nullable(),
    location: p.string(),
    project: () => p.manyToOne(Project).deleteRule('cascade'),
    author: () => p.manyToOne(User).deleteRule('cascade'),
    /** Extra staff tagged as also working on this activity, besides the author. */
    collaborators: () => p.manyToMany(User).owner(),
    photos: () => p.oneToMany(Photo).mappedBy('activity').orphanRemoval(),
    createdAt: p.datetime().onCreate(() => new Date()),
  },
});

export class Activity extends ActivitySchema.class {}
ActivitySchema.setClass(Activity);
