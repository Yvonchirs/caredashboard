import { EntityManager } from '@mikro-orm/sqlite';
import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { daysBetween } from '../common/date.util.js';
import { serializeActivity } from '../common/serializers.js';
import { Activity, Photo, Project, User } from '../entities/index.js';
import type { CreateActivityDto, UpdateActivityDto } from './activities.dto.js';
import { removeUploads } from './upload.config.js';

@Injectable()
export class ActivitiesService {
  constructor(private readonly em: EntityManager) {}

  async findMine(user: User, from: string, to: string) {
    assertRange(from, to);
    const activities = await this.em.find(
      Activity,
      { author: user, date: { $gte: from, $lte: to } },
      { populate: ['project', 'author', 'photos'], orderBy: { date: 'desc', startTime: 'asc' } },
    );
    return activities.map(serializeActivity);
  }

  async create(user: User, dto: CreateActivityDto, files: Express.Multer.File[]) {
    try {
      const project = await this.resolveProject(user, dto.projectId);
      const activity = this.em.create(Activity, {
        title: dto.title.trim(),
        description: dto.description?.trim() || null,
        date: dto.date,
        startTime: dto.startTime || null,
        location: dto.location.trim(),
        project,
        author: user,
      });
      for (const file of files) this.em.create(Photo, { filename: file.filename, activity });
      await this.em.flush();
      await this.em.populate(activity, ['photos']);
      return serializeActivity(activity);
    } catch (error) {
      await removeUploads(files.map((file) => file.filename));
      throw error;
    }
  }

  async update(user: User, id: number, dto: UpdateActivityDto) {
    const activity = await this.findEditable(user, id);
    if (dto.projectId !== undefined) activity.project = await this.resolveProject(user, dto.projectId);
    if (dto.title !== undefined) activity.title = dto.title.trim();
    if (dto.description !== undefined) activity.description = dto.description.trim() || null;
    if (dto.date !== undefined) activity.date = dto.date;
    if (dto.startTime !== undefined) activity.startTime = dto.startTime || null;
    if (dto.location !== undefined) activity.location = dto.location.trim();
    await this.em.flush();
    return serializeActivity(activity);
  }

  async remove(user: User, id: number) {
    const activity = await this.findEditable(user, id);
    const filenames = activity.photos.getItems().map((photo) => photo.filename);
    await this.em.remove(activity).flush();
    await removeUploads(filenames);
  }

  private async findEditable(user: User, id: number) {
    const activity = await this.em.findOneOrFail(Activity, id, { populate: ['project', 'author', 'photos'] });
    if (user.role !== 'admin' && activity.author.id !== user.id) {
      throw new ForbiddenException('You can only change your own activities');
    }
    return activity;
  }

  private async resolveProject(user: User, projectId: number) {
    const project = await this.em.findOne(Project, { id: projectId, isActive: true });
    if (!project) throw new BadRequestException('Project not found or inactive');
    const allowed = user.role === 'admin' || user.projects.getItems().some((p) => p.id === project.id);
    if (!allowed) throw new ForbiddenException('You are not assigned to this project');
    return project;
  }
}

export function assertRange(from: string, to: string) {
  const span = daysBetween(from, to);
  if (Number.isNaN(span) || span < 0) throw new BadRequestException('Invalid date range');
  if (span > 31) throw new BadRequestException('Date range cannot exceed 31 days');
}
