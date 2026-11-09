import { Module } from '@nestjs/common';
import { WorkStatusController } from './work-status.controller.js';
import { WorkStatusService } from './work-status.service.js';

@Module({ controllers: [WorkStatusController], providers: [WorkStatusService] })
export class WorkStatusModule {}
