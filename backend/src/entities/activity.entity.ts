import { defineEntity, p } from '@mikro-orm/core';
import { Photo } from './photo.entity.js';
import { Project } from './project.entity.js';
import { User } from './user.entity.js';

export const ACTIVITY_STATUSES = ['pending', 'live', 'completed'] as const;
export type ActivityStatus = (typeof ACTIVITY_STATUSES)[number];
// Status is not stored: it is derived from the dates and times, see common/date.util.ts#computeActivityStatus.

export const ActivitySchema = defineEntity({
  name: 'Activity',
  properties: {
    id: p.integer().primary(),
    title: p.string(),
    description: p.text().nullable(),
    /** First calendar day in YYYY-MM-DD form. */
    date: p.string().length(10).index(),
    /** Last calendar day for multi-day activities; null when the activity ends on `date`. */
    endDate: p.string().length(10).nullable().index(),
    startTime: p.string().length(5).nullable(),
    endTime: p.string().length(5).nullable(),
    location: p.string(),
    /** Set once the activity is completed, see common/date.util.ts#computeActivityStatus. */
    outcome: p.text().nullable(),
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
