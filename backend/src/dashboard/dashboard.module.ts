import { Module } from '@nestjs/common';
import { ActivitiesModule } from '../activities/activities.module.js';
import { DashboardController } from './dashboard.controller.js';
import { DashboardService } from './dashboard.service.js';

@Module({ imports: [ActivitiesModule], controllers: [DashboardController], providers: [DashboardService] })
export class DashboardModule {}
