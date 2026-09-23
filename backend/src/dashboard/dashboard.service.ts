import { EntityManager } from '@mikro-orm/sql';
import { Injectable } from '@nestjs/common';
import { assertRange } from '../activities/activities.service.js';
import { serializeActivity } from '../common/serializers.js';
import { Activity } from '../entities/index.js';
import type { DashboardDto, DashboardProjectDto } from './dashboard.dto.js';

@Injectable()
export class DashboardService {
  constructor(private readonly em: EntityManager) {}

  async get(from: string, to: string): Promise<DashboardDto> {
    assertRange(from, to);
    const activities = await this.em.find(
      Activity,
      { date: { $gte: from, $lte: to }, project: { isActive: true } },
      { populate: ['project', 'author', 'photos'], orderBy: { date: 'asc', startTime: 'asc', id: 'asc' } },
    );

    const byProject = new Map<number, DashboardProjectDto>();
    for (const activity of activities) {
      const { project } = activity;
      const entry = byProject.get(project.id) ?? {
        id: project.id,
        name: project.name,
        code: project.code,
        location: project.location ?? null,
        activities: [],
      };
      entry.activities.push(serializeActivity(activity));
      byProject.set(project.id, entry);
    }

    const projects = [...byProject.values()].sort(
      (a, b) => b.activities.length - a.activities.length || a.name.localeCompare(b.name),
    );

    return {
      from,
      to,
      stats: {
        activities: activities.length,
        projects: projects.length,
        staff: new Set(activities.map((a) => a.author.id)).size,
        locations: new Set(activities.map((a) => a.location.trim().toLowerCase())).size,
      },
      projects,
    };
  }
}
