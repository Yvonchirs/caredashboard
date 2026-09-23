import { Body, Controller, Get, HttpCode, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiForbiddenResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard.js';
import { CurrentUser } from '../common/current-user.decorator.js';
import { Roles } from '../common/roles.decorator.js';
import type { User } from '../entities/index.js';
import { CreateUserDto, UpdateUserDto, UserDto, UserWithPasswordDto } from './users.dto.js';
import { UsersService } from './users.service.js';

@ApiTags('Users (admin)')
@ApiBearerAuth()
@ApiForbiddenResponse({ description: 'Admin role required' })
@Controller('users')
@UseGuards(AuthGuard)
@Roles(['admin'])
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @ApiOkResponse({ type: [UserDto] })
  findAll() {
    return this.users.findAll();
  }

  @Post()
  @ApiCreatedResponse({ type: UserWithPasswordDto })
  create(@Body() dto: CreateUserDto) {
    return this.users.create(dto);
  }

  @Patch(':id')
  @ApiOkResponse({ type: UserDto, description: 'Update profile, role, project permissions or active status' })
  update(@CurrentUser() actor: User, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    return this.users.update(actor, id, dto);
  }

  @Post(':id/reset-password')
  @HttpCode(200)
  @ApiOkResponse({ type: UserWithPasswordDto })
  resetPassword(@Param('id', ParseIntPipe) id: number) {
    return this.users.resetPassword(id);
  }
}
