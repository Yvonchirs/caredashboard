import { EntityManager } from '@mikro-orm/sqlite';
import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { assertRange } from '../activities/activities.service.js';
import { addDays, occurrencesBetween } from '../common/date.util.js';
import { serializeNotice } from '../common/serializers.js';
import { Notice, type User } from '../entities/index.js';
import type { CreateNoticeDto } from './notices.dto.js';

/** Deadlines start showing on the board this many days before they are due. */
export const DEADLINE_LEAD_DAYS = 5;

export function canPostNotices(user: User) {
  return user.role === 'admin' || user.canPostNotices;
}

@Injectable()
export class NoticesService {
  constructor(private readonly em: EntityManager) {}

  async findInRange(from: string, to: string) {
    assertRange(from, to);
    const deadlinesTo = addDays(to, DEADLINE_LEAD_DAYS);
    const notices = await this.em.find(
      Notice,
      {
        $or: [
          { kind: 'announcement', date: { $gte: from, $lte: to } },
          { kind: 'deadline', recurrence: null, date: { $gte: from, $lte: deadlinesTo } },
          {
            kind: 'deadline',
            recurrence: { $ne: null },
            date: { $lte: deadlinesTo },
            $or: [{ recurUntil: null }, { recurUntil: { $gte: from } }],
          },
        ],
      },
      { populate: ['author'] },
    );

    // Recurring deadlines appear once per occurrence, each with that occurrence's date.
    return notices
      .flatMap((notice) =>
        notice.recurrence
          ? occurrencesBetween(notice.date, notice.recurrence, from, deadlinesTo, notice.recurUntil).map((date) =>
              serializeNotice(notice, date),
            )
          : [serializeNotice(notice)],
      )
      .sort(
        (a, b) =>
          a.date.localeCompare(b.date) ||
          b.kind.localeCompare(a.kind) ||
          (a.time ?? '').localeCompare(b.time ?? '') ||
          a.id - b.id,
      );
  }

  async create(user: User, dto: CreateNoticeDto) {
    if (!canPostNotices(user)) throw new ForbiddenException('You are not allowed to post deadlines or announcements');
    const recurrence = dto.kind === 'deadline' ? (dto.recurrence ?? null) : null;
    const recurUntil = recurrence ? (dto.recurUntil ?? null) : null;
    if (recurUntil && recurUntil < dto.date) throw new BadRequestException('"Repeat until" must be on or after the first due date');
    const notice = this.em.create(Notice, {
      kind: dto.kind,
      title: dto.title.trim(),
      details: dto.details?.trim() || null,
      date: dto.date,
      time: dto.kind === 'deadline' ? dto.time || null : null,
      recurrence,
      recurUntil,
      author: user,
    });
    await this.em.flush();
    return serializeNotice(notice);
  }

  async remove(user: User, id: number) {
    const notice = await this.em.findOneOrFail(Notice, id);
    if (user.role !== 'admin' && !(canPostNotices(user) && notice.author.id === user.id)) {
      throw new ForbiddenException('You can only remove your own notices');
    }
    await this.em.remove(notice).flush();
  }
}
