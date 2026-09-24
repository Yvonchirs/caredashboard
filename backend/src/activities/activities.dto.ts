import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayUnique, IsArray, IsIn, IsInt, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { ISO_DATE } from '../common/date.util.js';
import { ACTIVITY_STATUSES, type ActivityStatus } from '../entities/index.js';
import { ProjectRefDto, StaffRefDto } from '../users/users.dto.js';

export class PhotoDto {
  @ApiProperty() id: number;
  @ApiProperty({ example: '/uploads/1727100000000-a1b2c3.jpg', description: 'Path relative to the API origin' })
  url: string;
}

export class ActivityDto {
  @ApiProperty() id: number;
  @ApiProperty() title: string;
  @ApiProperty({ type: String, nullable: true }) description: string | null;
  @ApiProperty({ example: '2026-09-23' }) date: string;
  @ApiProperty({ type: String, nullable: true, example: '09:30' }) startTime: string | null;
  @ApiProperty() location: string;
  @ApiProperty({ enum: ACTIVITY_STATUSES }) status: ActivityStatus;
  @ApiProperty({ description: 'Whether the scheduled date/time has arrived — editing is blocked once true' })
  hasStarted: boolean;
  @ApiProperty({ type: ProjectRefDto }) project: ProjectRefDto;
  @ApiProperty({ type: StaffRefDto, description: 'The staff member who logged the activity' })
  author: StaffRefDto;
  @ApiProperty({ type: [StaffRefDto], description: 'Additional staff also working on this activity' })
  collaborators: StaffRefDto[];
  @ApiProperty({ type: [PhotoDto] }) photos: PhotoDto[];
  @ApiProperty() createdAt: Date;
}

export class CreateActivityDto {
  @ApiProperty({ example: 'Village savings group training' })
  @IsString()
  @MinLength(3)
  @MaxLength(160)
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiProperty({ example: '2026-09-23', description: 'YYYY-MM-DD' })
  @Matches(ISO_DATE, { message: 'date must be in YYYY-MM-DD format' })
  date: string;

  @ApiPropertyOptional({ example: '09:30', description: 'HH:mm' })
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'startTime must be in HH:mm format' })
  startTime?: string;

  @ApiProperty({ example: 'Kigali, Gasabo District' })
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  location: string;

  @ApiPropertyOptional({ enum: ACTIVITY_STATUSES, default: 'pending' })
  @IsOptional()
  @IsIn(ACTIVITY_STATUSES)
  status?: ActivityStatus;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  projectId: number;

  @ApiPropertyOptional({
    type: [Number],
    description: 'Other staff working on this activity alongside the person logging it',
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @Type(() => Number)
  @IsInt({ each: true })
  collaboratorIds?: number[];
}

export class CreateActivityWithPhotosDto extends CreateActivityDto {
  @ApiPropertyOptional({ type: 'array', items: { type: 'string', format: 'binary' }, description: 'Up to 6 images, 5 MB each' })
  photos?: unknown[];
}

export class UpdateActivityDto extends PartialType(CreateActivityDto) {}

export class DateRangeQueryDto {
  @ApiProperty({ example: '2026-09-21' })
  @Matches(ISO_DATE, { message: 'from must be in YYYY-MM-DD format' })
  from: string;

  @ApiProperty({ example: '2026-09-27' })
  @Matches(ISO_DATE, { message: 'to must be in YYYY-MM-DD format' })
  to: string;
}
