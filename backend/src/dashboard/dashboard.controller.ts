import { Controller, Get, Param, ParseIntPipe, Query, Res } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiProduces, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { DateRangeQueryDto } from '../activities/activities.dto.js';
import { ActivitiesService } from '../activities/activities.service.js';
import { ActivityReportService } from '../activities/activity-report.service.js';
import { DashboardDto } from './dashboard.dto.js';
import { DashboardService } from './dashboard.service.js';

@ApiTags('Dashboard (public)')
@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboard: DashboardService,
    private readonly activities: ActivitiesService,
    private readonly report: ActivityReportService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Activities grouped by project for a day or week. No authentication required.' })
  @ApiOkResponse({ type: DashboardDto })
  get(@Query() query: DateRangeQueryDto) {
    return this.dashboard.get(query.from, query.to);
  }

  @Get('activities/:id/report')
  @ApiOperation({
    summary: 'Download a PDF report for a completed activity. No authentication required.',
    description: 'Same information already shown on the public board, formatted as a printable PDF with its outcome.',
  })
  @ApiProduces('application/pdf')
  async downloadReport(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const activity = await this.activities.findForReport(id);
    const doc = this.report.generate(activity);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="activity-${id}-report.pdf"`);
    doc.pipe(res);
  }
}
