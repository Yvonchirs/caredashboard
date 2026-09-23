import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DateRangeQueryDto } from '../activities/activities.dto.js';
import { DashboardDto } from './dashboard.dto.js';
import { DashboardService } from './dashboard.service.js';

@ApiTags('Dashboard (public)')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Activities grouped by project for a day or week. No authentication required.' })
  @ApiOkResponse({ type: DashboardDto })
  get(@Query() query: DateRangeQueryDto) {
    return this.dashboard.get(query.from, query.to);
  }
}
