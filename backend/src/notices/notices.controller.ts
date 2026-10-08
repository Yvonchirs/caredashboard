import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { DateRangeQueryDto } from '../activities/activities.dto.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { CurrentUser } from '../common/current-user.decorator.js';
import type { User } from '../entities/index.js';
import { CreateNoticeDto, NoticeDto } from './notices.dto.js';
import { NoticesService } from './notices.service.js';

@ApiTags('Notices')
@Controller('notices')
export class NoticesController {
  constructor(private readonly notices: NoticesService) {}

  @Get()
  @ApiOperation({
    summary: 'Announcements dated in the range, and deadlines due in the range or up to 5 days after it. No authentication required.',
  })
  @ApiOkResponse({ type: [NoticeDto] })
  find(@Query() query: DateRangeQueryDto) {
    return this.notices.findInRange(query.from, query.to);
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Post a deadline or announcement (admins and users granted the permission)' })
  @ApiCreatedResponse({ type: NoticeDto })
  @ApiForbiddenResponse({ description: 'Not allowed to post notices' })
  create(@CurrentUser() user: User, @Body() dto: CreateNoticeDto) {
    return this.notices.create(user, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a notice (its author, or an admin)' })
  @ApiNoContentResponse()
  @ApiForbiddenResponse({ description: 'Not the author or an admin' })
  remove(@CurrentUser() user: User, @Param('id', ParseIntPipe) id: number) {
    return this.notices.remove(user, id);
  }
}
