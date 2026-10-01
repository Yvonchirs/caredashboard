import { Module } from '@nestjs/common';
import { ActivitiesController } from './activities.controller.js';
import { ActivitiesService } from './activities.service.js';
import { ActivityReportService } from './activity-report.service.js';

@Module({
  controllers: [ActivitiesController],
  providers: [ActivitiesService, ActivityReportService],
  exports: [ActivitiesService, ActivityReportService],
})
export class ActivitiesModule {}
