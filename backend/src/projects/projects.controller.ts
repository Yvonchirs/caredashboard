import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard.js';
import { CurrentUser } from '../common/current-user.decorator.js';
import { Roles } from '../common/roles.decorator.js';
import type { User } from '../entities/index.js';
import { CreateProjectDto, ProjectDto, UpdateProjectDto } from './projects.dto.js';
import { ProjectsService } from './projects.service.js';

@ApiTags('Projects')
@ApiBearerAuth()
@Controller('projects')
@UseGuards(AuthGuard)
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get()
  @Roles(['admin'])
  @ApiOperation({ summary: 'List all projects (admin)' })
  @ApiOkResponse({ type: [ProjectDto] })
  findAll() {
    return this.projects.findAll();
  }

  @Get('mine')
  @ApiOperation({ summary: 'Active projects the current user may log activities for' })
  @ApiOkResponse({ type: [ProjectDto] })
  findMine(@CurrentUser() user: User) {
    return this.projects.findForUser(user);
  }

  @Post()
  @Roles(['admin'])
  @ApiOperation({ summary: 'Create a project (admin)' })
  @ApiCreatedResponse({ type: ProjectDto })
  create(@Body() dto: CreateProjectDto) {
    return this.projects.create(dto);
  }

  @Patch(':id')
  @Roles(['admin'])
  @ApiOperation({ summary: 'Update or archive a project (admin)' })
  @ApiOkResponse({ type: ProjectDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProjectDto) {
    return this.projects.update(id, dto);
  }
}
