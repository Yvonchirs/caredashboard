import { Body, Controller, Delete, Get, HttpCode, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiForbiddenResponse, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DateRangeQueryDto } from '../activities/activities.dto.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { CurrentUser } from '../common/current-user.decorator.js';
import type { User } from '../entities/index.js';
import { MyWorkStatusDto, SetWorkStatusDto, WorkStatusCountsDto, WorkStatusDateQueryDto, WorkStatusPersonDto } from './work-status.dto.js';
import { WorkStatusService } from './work-status.service.js';

@ApiTags('Work status')
@Controller('work-status')
export class WorkStatusController {
  constructor(private readonly workStatus: WorkStatusService) {}

  @Get()
  @ApiOperation({ summary: 'How many active staff are in the office, at home, on the field or on leave on a day. No authentication required.' })
  @ApiOkResponse({ type: WorkStatusCountsDto })
  counts(@Query() query: WorkStatusDateQueryDto) {
    return this.workStatus.counts(query.date);
  }

  @Get('people')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Who is working where on a day, by name (admins and users on the access list)' })
  @ApiOkResponse({ type: [WorkStatusPersonDto] })
  @ApiForbiddenResponse({ description: 'Not on the access list' })
  people(@CurrentUser() user: User, @Query() query: WorkStatusDateQueryDto) {
    return this.workStatus.people(user, query.date);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "The signed-in user's own work status for each day in a range (null where not set)" })
  @ApiOkResponse({ type: [MyWorkStatusDto] })
  mine(@CurrentUser() user: User, @Query() query: DateRangeQueryDto) {
    return this.workStatus.mine(user, query.from, query.to);
  }

  @Put('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Say where you are working on a day (replaces any earlier choice for that day)' })
  @ApiOkResponse({ type: MyWorkStatusDto })
  set(@CurrentUser() user: User, @Body() dto: SetWorkStatusDto) {
    return this.workStatus.set(user, dto);
  }

  @Delete('me')
  @HttpCode(204)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Clear your work status for a day' })
  @ApiNoContentResponse()
  clear(@CurrentUser() user: User, @Query() query: WorkStatusDateQueryDto) {
    return this.workStatus.clear(user, query.date);
  }
}
