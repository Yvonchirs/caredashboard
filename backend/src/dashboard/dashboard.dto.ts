import { ApiProperty } from '@nestjs/swagger';
import { ActivityDto } from '../activities/activities.dto.js';

export class DashboardProjectDto {
  @ApiProperty() id: number;
  @ApiProperty() name: string;
  @ApiProperty() code: string;
  @ApiProperty({ type: String, nullable: true }) location: string | null;
  @ApiProperty({ type: [ActivityDto] }) activities: ActivityDto[];
}

export class DashboardStatsDto {
  @ApiProperty() activities: number;
  @ApiProperty({ description: 'Projects with at least one activity in range' }) projects: number;
  @ApiProperty({ description: 'Distinct staff who logged activities in range' }) staff: number;
  @ApiProperty() locations: number;
}

export class DashboardDto {
  @ApiProperty({ example: '2026-09-21' }) from: string;
  @ApiProperty({ example: '2026-09-27' }) to: string;
  @ApiProperty({ type: DashboardStatsDto }) stats: DashboardStatsDto;
  @ApiProperty({ type: [DashboardProjectDto], description: 'Projects with activities, busiest first' })
  projects: DashboardProjectDto[];
}
