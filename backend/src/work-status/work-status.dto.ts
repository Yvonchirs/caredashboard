import { ApiProperty } from '@nestjs/swagger';
import { IsIn, Matches } from 'class-validator';
import { ISO_DATE } from '../common/date.util.js';
import { WORK_STATUSES, type WorkStatusKind } from '../entities/index.js';

export class WorkStatusDateQueryDto {
  @ApiProperty({ example: '2026-11-09' })
  @Matches(ISO_DATE, { message: 'date must be in YYYY-MM-DD format' })
  date: string;
}

export class SetWorkStatusDto extends WorkStatusDateQueryDto {
  @ApiProperty({ enum: WORK_STATUSES })
  @IsIn(WORK_STATUSES)
  status: WorkStatusKind;
}

export class WorkStatusCountsDto {
  @ApiProperty({ example: '2026-11-09' }) date: string;
  @ApiProperty({ description: 'Active staff working from the office' }) office: number;
  @ApiProperty({ description: 'Active staff working from home' }) home: number;
  @ApiProperty({ description: 'Active staff on the field' }) field: number;
  @ApiProperty({ description: 'Active staff on leave' }) leave: number;
  @ApiProperty({ description: 'Active staff who have not said where they are working' }) notSet: number;
}

export class MyWorkStatusDto {
  @ApiProperty({ example: '2026-11-09' }) date: string;
  @ApiProperty({ enum: WORK_STATUSES, nullable: true }) status: WorkStatusKind | null;
}

export class WorkStatusPersonDto {
  @ApiProperty() id: number;
  @ApiProperty() name: string;
  @ApiProperty({ type: String, nullable: true }) jobTitle: string | null;
  @ApiProperty({ enum: WORK_STATUSES, nullable: true, description: 'Null when not yet set' }) status: WorkStatusKind | null;
}
