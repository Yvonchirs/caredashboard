import { EntityManager, UniqueConstraintViolationException } from '@mikro-orm/sqlite';
import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { generateTemporaryPassword, hashPassword } from '../common/password.util.js';
import { serializeStaffRef, serializeUser } from '../common/serializers.js';
import { Project, User } from '../entities/index.js';
import type { CreateUserDto, UpdateUserDto } from './users.dto.js';

@Injectable()
export class UsersService {
  constructor(private readonly em: EntityManager) {}

  async findAll() {
    const users = await this.em.findAll(User, { populate: ['projects'], orderBy: { name: 'asc' } });
    return users.map(serializeUser);
  }

  async directory() {
    const users = await this.em.find(User, { isActive: true }, { orderBy: { name: 'asc' } });
    return users.map(serializeStaffRef);
  }

  async create(dto: CreateUserDto) {
    const temporaryPassword = generateTemporaryPassword();
    const user = this.em.create(User, {
      name: dto.name.trim(),
      email: dto.email.toLowerCase(),
      jobTitle: dto.jobTitle?.trim() || null,
      role: dto.role,
      passwordHash: await hashPassword(temporaryPassword),
      mustChangePassword: true,
    });
    if (dto.projectIds) user.projects.set(await this.loadProjects(dto.projectIds));
    await this.flushUnique();
    return { user: serializeUser(user), temporaryPassword };
  }

  async update(actor: User, id: number, dto: UpdateUserDto) {
    const user = await this.em.findOneOrFail(User, id, { populate: ['projects'] });
    if (user.id === actor.id && (dto.isActive === false || (dto.role && dto.role !== 'admin'))) {
      throw new BadRequestException('You cannot deactivate or demote your own account');
    }

    if (dto.name !== undefined) user.name = dto.name.trim();
    if (dto.email !== undefined) user.email = dto.email.toLowerCase();
    if (dto.jobTitle !== undefined) user.jobTitle = dto.jobTitle.trim() || null;
    if (dto.role !== undefined) user.role = dto.role;
    if (dto.isActive !== undefined) user.isActive = dto.isActive;
    if (dto.projectIds !== undefined) user.projects.set(await this.loadProjects(dto.projectIds));

    await this.flushUnique();
    return serializeUser(user);
  }

  async resetPassword(id: number) {
    const user = await this.em.findOneOrFail(User, id, { populate: ['projects'] });
    const temporaryPassword = generateTemporaryPassword();
    user.passwordHash = await hashPassword(temporaryPassword);
    user.mustChangePassword = true;
    await this.em.flush();
    return { user: serializeUser(user), temporaryPassword };
  }

  private async loadProjects(ids: number[]) {
    const projects = await this.em.find(Project, { id: { $in: ids } });
    if (projects.length !== ids.length) throw new BadRequestException('One or more projects do not exist');
    return projects;
  }

  private async flushUnique() {
    try {
      await this.em.flush();
    } catch (error) {
      if (error instanceof UniqueConstraintViolationException) {
        throw new ConflictException('A user with this email already exists');
      }
      throw error;
    }
  }
}
