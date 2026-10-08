import { defineEntity, p } from '@mikro-orm/core';
import { User } from './user.entity.js';

export const NOTICE_KINDS = ['deadline', 'announcement'] as const;
export type NoticeKind = (typeof NOTICE_KINDS)[number];
export const NOTICE_RECURRENCES = ['weekly', 'monthly', 'month-end', 'mid-and-month-end', 'quarterly', 'yearly'] as const;
export type NoticeRecurrence = (typeof NOTICE_RECURRENCES)[number];

/** A deadline or announcement shown in the board's side panel on its date. */
export const NoticeSchema = defineEntity({
  name: 'Notice',
  properties: {
    id: p.integer().primary(),
    kind: p.enum(NOTICE_KINDS),
    title: p.string(),
    details: p.text().nullable(),
    /** Day the notice applies to (the due date for deadlines), YYYY-MM-DD. */
    date: p.string().length(10).index(),
    /** Due time for deadlines, HH:mm. */
    time: p.string().length(5).nullable(),
    /**
     * Repeat pattern for recurring deadlines; `date` is then the first occurrence. Plain text (validated by the DTO)
     * so new patterns don't need a SQLite table rebuild for a CHECK constraint.
     */
    recurrence: p.string().length(20).$type<NoticeRecurrence>().nullable(),
    /** Last day a recurring deadline may fall on, YYYY-MM-DD; null repeats indefinitely. */
    recurUntil: p.string().length(10).nullable(),
    author: () => p.manyToOne(User).deleteRule('cascade'),
    createdAt: p.datetime().onCreate(() => new Date()),
  },
});

export class Notice extends NoticeSchema.class {}
NoticeSchema.setClass(Notice);
