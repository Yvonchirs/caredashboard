import { defineEntity, p } from '@mikro-orm/core';
import { Photo } from './photo.entity.js';
import { Project } from './project.entity.js';
import { User } from './user.entity.js';

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
    photos: () => p.oneToMany(Photo).mappedBy('activity').orphanRemoval(),
    createdAt: p.datetime().onCreate(() => new Date()),
  },
});

export class Activity extends ActivitySchema.class {}
ActivitySchema.setClass(Activity);
