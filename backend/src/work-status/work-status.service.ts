import { EntityManager } from '@mikro-orm/sqlite';
import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { addDays, nowInAppTz } from '../common/date.util.js';
import { User, WorkStatus } from '../entities/index.js';
import type { MyWorkStatusDto, SetWorkStatusDto, WorkStatusCountsDto, WorkStatusPersonDto } from './work-status.dto.js';

/** Status can be set this many days back and ahead of today. */
const DAYS_BACK = 7;
const DAYS_AHEAD = 60;

export function canSeeWorkStatus(user: User) {
  return user.role === 'admin' || user.canSeeWorkStatus;
}

@Injectable()
export class WorkStatusService {
  constructor(private readonly em: EntityManager) {}

  async counts(date: string): Promise<WorkStatusCountsDto> {
    const [entries, activeStaff] = await Promise.all([
      this.em.find(WorkStatus, { date, user: { isActive: true } }),
      this.em.count(User, { isActive: true }),
    ]);
    const counts = { office: 0, home: 0, field: 0, leave: 0 };
    for (const entry of entries) counts[entry.status]++;
    return { date, ...counts, notSet: Math.max(activeStaff - entries.length, 0) };
  }

  /** Names behind the counts, for users on the access list. */
  async people(user: User, date: string): Promise<WorkStatusPersonDto[]> {
    if (!canSeeWorkStatus(user)) throw new ForbiddenException('You are not on the access list to see who is working where');
    const [users, entries] = await Promise.all([
      this.em.find(User, { isActive: true }, { orderBy: { name: 'asc' } }),
      this.em.find(WorkStatus, { date, user: { isActive: true } }),
    ]);
    const byUser = new Map(entries.map((entry) => [entry.user.id, entry.status]));
    return users.map((u) => ({ id: u.id, name: u.name, jobTitle: u.jobTitle ?? null, status: byUser.get(u.id) ?? null }));
  }

  async mine(user: User, from: string, to: string): Promise<MyWorkStatusDto[]> {
    const entries = await this.em.find(WorkStatus, { user, date: { $gte: from, $lte: to } });
    const byDate = new Map(entries.map((entry) => [entry.date, entry.status]));
    const days: MyWorkStatusDto[] = [];
    for (let date = from; date <= to && days.length < 62; date = addDays(date, 1)) {
      days.push({ date, status: byDate.get(date) ?? null });
    }
    return days;
  }

  async set(user: User, dto: SetWorkStatusDto): Promise<MyWorkStatusDto> {
    this.assertSettable(dto.date);
    const entry = await this.em.findOne(WorkStatus, { user, date: dto.date });
    if (entry) entry.status = dto.status;
    else this.em.create(WorkStatus, { user, date: dto.date, status: dto.status });
    await this.em.flush();
    return { date: dto.date, status: dto.status };
  }

  async clear(user: User, date: string) {
    await this.em.nativeDelete(WorkStatus, { user, date });
  }

  private assertSettable(date: string) {
    const today = nowInAppTz().date;
    if (date < addDays(today, -DAYS_BACK) || date > addDays(today, DAYS_AHEAD)) {
      throw new BadRequestException(`You can set your status from ${DAYS_BACK} days ago up to ${DAYS_AHEAD} days ahead`);
    }
  }
}
