import { EntityManager, UniqueConstraintViolationException } from '@mikro-orm/sqlite';
import { ConflictException, Injectable } from '@nestjs/common';
import { Project, User } from '../entities/index.js';
import type { CreateProjectDto, UpdateProjectDto } from './projects.dto.js';

@Injectable()
export class ProjectsService {
  constructor(private readonly em: EntityManager) {}

  async findAll() {
    const projects = await this.em.findAll(Project, { populate: ['members'], orderBy: { name: 'asc' } });
    return projects.map((project) => this.serialize(project));
  }

  async findForUser(user: User) {
    const where = user.role === 'admin' ? { isActive: true } : { isActive: true, members: user };
    const projects = await this.em.find(Project, where, { populate: ['members'], orderBy: { name: 'asc' } });
    return projects.map((project) => this.serialize(project));
  }

  async create(dto: CreateProjectDto) {
    const project = this.em.create(Project, {
      name: dto.name.trim(),
      code: dto.code.toUpperCase(),
      description: dto.description?.trim() || null,
      location: dto.location?.trim() || null,
    });
    await this.flushUnique();
    await this.em.populate(project, ['members']);
    return this.serialize(project);
  }

  async update(id: number, dto: UpdateProjectDto) {
    const project = await this.em.findOneOrFail(Project, id, { populate: ['members'] });
    if (dto.name !== undefined) project.name = dto.name.trim();
    if (dto.code !== undefined) project.code = dto.code.toUpperCase();
    if (dto.description !== undefined) project.description = dto.description.trim() || null;
    if (dto.location !== undefined) project.location = dto.location.trim() || null;
    if (dto.isActive !== undefined) project.isActive = dto.isActive;
    await this.flushUnique();
    return this.serialize(project);
  }

  private serialize(project: Project) {
    return {
      id: project.id,
      name: project.name,
      code: project.code,
      description: project.description ?? null,
      location: project.location ?? null,
      isActive: project.isActive,
      memberCount: project.members.isInitialized() ? project.members.count() : 0,
      createdAt: project.createdAt,
    };
  }

  private async flushUnique() {
    try {
      await this.em.flush();
    } catch (error) {
      if (error instanceof UniqueConstraintViolationException) {
        throw new ConflictException('A project with this code already exists');
      }
      throw error;
    }
  }
}
