import { EntityManager } from '@mikro-orm/sqlite';
import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { computeActivityStatus, daysBetween } from '../common/date.util.js';
import { serializeActivity } from '../common/serializers.js';
import { Activity, Photo, Project, User } from '../entities/index.js';
import type { CreateActivityDto, UpdateActivityDto } from './activities.dto.js';
import { MAX_PHOTOS, removeUploads } from './upload.config.js';

const ACTIVITY_POPULATE = ['project', 'author', 'collaborators', 'photos'] as const;

@Injectable()
export class ActivitiesService {
  constructor(private readonly em: EntityManager) {}

  async findMine(user: User, from: string, to: string) {
    assertRange(from, to);
    const activities = await this.em.find(
      Activity,
      { $or: [{ author: user }, { collaborators: user }], date: { $gte: from, $lte: to } },
      { populate: ACTIVITY_POPULATE, orderBy: { date: 'desc', startTime: 'asc' } },
    );
    return activities.map(serializeActivity);
  }

  async create(user: User, dto: CreateActivityDto, files: Express.Multer.File[]) {
    try {
      assertTimeOrder(dto.startTime ?? null, dto.endTime ?? null);
      const project = await this.resolveProject(user, dto.projectId);
      const collaborators = await this.resolveCollaborators(dto.collaboratorIds, user.id);
      const activity = this.em.create(Activity, {
        title: dto.title.trim(),
        description: dto.description?.trim() || null,
        date: dto.date,
        startTime: dto.startTime || null,
        endTime: dto.endTime || null,
        location: dto.location.trim(),
        project,
        author: user,
        collaborators,
      });
      this.createPhotos(files, dto.captions, activity);
      await this.em.flush();
      await this.em.populate(activity, ['photos', 'collaborators']);
      return serializeActivity(activity);
    } catch (error) {
      await removeUploads(files.map((file) => file.filename));
      throw error;
    }
  }

  async update(user: User, id: number, dto: UpdateActivityDto) {
    const activity = await this.findEditable(user, id);
    if (user.role !== 'admin' && computeActivityStatus(activity.date, activity.startTime ?? null, activity.endTime ?? null) !== 'pending') {
      throw new ForbiddenException('This activity has already started and can no longer be edited');
    }
    if (dto.projectId !== undefined) activity.project = await this.resolveProject(user, dto.projectId);
    if (dto.title !== undefined) activity.title = dto.title.trim();
    if (dto.description !== undefined) activity.description = dto.description.trim() || null;
    if (dto.date !== undefined) activity.date = dto.date;
    if (dto.startTime !== undefined) activity.startTime = dto.startTime || null;
    if (dto.endTime !== undefined) activity.endTime = dto.endTime || null;
    if (dto.location !== undefined) activity.location = dto.location.trim();
    if (dto.collaboratorIds !== undefined) {
      activity.collaborators.set(await this.resolveCollaborators(dto.collaboratorIds, activity.author.id));
    }
    assertTimeOrder(activity.startTime ?? null, activity.endTime ?? null);
    await this.em.flush();
    return serializeActivity(activity);
  }

  async setOutcome(user: User, id: number, outcome: string) {
    const activity = await this.findEditable(user, id);
    if (user.role !== 'admin' && computeActivityStatus(activity.date, activity.startTime ?? null, activity.endTime ?? null) !== 'completed') {
      throw new ForbiddenException('The outcome can only be recorded once the activity is completed');
    }
    activity.outcome = outcome.trim();
    await this.em.flush();
    return serializeActivity(activity);
  }

  async addPhotos(user: User, id: number, files: Express.Multer.File[], captions?: string[]) {
    if (!files.length) throw new BadRequestException('Select at least one photo');
    try {
      const activity = await this.findEditable(user, id);
      if (user.role !== 'admin' && computeActivityStatus(activity.date, activity.startTime ?? null, activity.endTime ?? null) !== 'live') {
        throw new ForbiddenException(
          'Photos can only be added while the activity is live — from its start time until the end of that day',
        );
      }
      if (activity.photos.length + files.length > MAX_PHOTOS) {
        throw new BadRequestException(`An activity can have at most ${MAX_PHOTOS} photos (it already has ${activity.photos.length})`);
      }
      this.createPhotos(files, captions, activity);
      await this.em.flush();
      return serializeActivity(activity);
    } catch (error) {
      await removeUploads(files.map((file) => file.filename));
      throw error;
    }
  }

  /** Links uploaded files to the activity as Photo entities, pairing each with its caption by position. */
  private createPhotos(files: Express.Multer.File[], captions: string[] | undefined, activity: Activity) {
    files.forEach((file, index) => {
      this.em.create(Photo, { filename: file.filename, caption: captions?.[index]?.trim() || null, activity });
    });
  }

  /** Loads a completed activity for its downloadable report. Public: no author/admin restriction. */
  async findForReport(id: number) {
    const activity = await this.em.findOneOrFail(Activity, id, { populate: ACTIVITY_POPULATE });
    if (computeActivityStatus(activity.date, activity.startTime ?? null, activity.endTime ?? null) !== 'completed') {
      throw new BadRequestException('The report is only available once the activity is completed');
    }
    return activity;
  }

  async remove(user: User, id: number) {
    const activity = await this.findEditable(user, id);
    const filenames = activity.photos.getItems().map((photo) => photo.filename);
    await this.em.remove(activity).flush();
    await removeUploads(filenames);
  }

  private async findEditable(user: User, id: number) {
    const activity = await this.em.findOneOrFail(Activity, id, { populate: ACTIVITY_POPULATE });
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

  private async resolveCollaborators(ids: number[] | undefined, authorId: number) {
    if (!ids?.length) return [];
    const uniqueIds = [...new Set(ids)].filter((id) => id !== authorId);
    if (uniqueIds.length === 0) return [];
    const users = await this.em.find(User, { id: { $in: uniqueIds }, isActive: true });
    if (users.length !== uniqueIds.length) throw new BadRequestException('One or more staff members were not found');
    return users;
  }
}

export function assertTimeOrder(startTime: string | null, endTime: string | null) {
  if (startTime && endTime && endTime <= startTime) {
    throw new BadRequestException('End time must be after start time');
  }
}

export function assertRange(from: string, to: string) {
  const span = daysBetween(from, to);
  if (Number.isNaN(span) || span < 0) throw new BadRequestException('Invalid date range');
  if (span > 31) throw new BadRequestException('Date range cannot exceed 31 days');
}
