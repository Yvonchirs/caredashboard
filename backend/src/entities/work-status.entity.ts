import { defineEntity, p } from '@mikro-orm/core';
import { User } from './user.entity.js';

export const WORK_STATUSES = ['office', 'home', 'field', 'leave'] as const;
export type WorkStatusKind = (typeof WORK_STATUSES)[number];

/** Where a staff member says they are working on a given day. One row per user per day. */
export const WorkStatusSchema = defineEntity({
  name: 'WorkStatus',
  uniques: [{ properties: ['user', 'date'] }],
  properties: {
    id: p.integer().primary(),
    user: () => p.manyToOne(User).deleteRule('cascade'),
    /** YYYY-MM-DD */
    date: p.string().length(10).index(),
    status: p.enum(WORK_STATUSES),
    createdAt: p.datetime().onCreate(() => new Date()),
  },
});

export class WorkStatus extends WorkStatusSchema.class {}
WorkStatusSchema.setClass(WorkStatus);
