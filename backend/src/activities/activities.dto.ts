import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayUnique, IsArray, IsInt, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { ISO_DATE, MAX_ACTIVITY_DAYS } from '../common/date.util.js';
import { ACTIVITY_STATUSES, type ActivityStatus } from '../entities/index.js';
import { ProjectRefDto, StaffRefDto } from '../users/users.dto.js';

export class PhotoDto {
  @ApiProperty() id: number;
  @ApiProperty({ example: '/uploads/1727100000000-a1b2c3.jpg', description: 'Path relative to the API origin' })
  url: string;
  @ApiProperty({ type: String, nullable: true, example: 'Mixing fertiliser before the demo plot' })
  caption: string | null;
}

export class ActivityDto {
  @ApiProperty() id: number;
  @ApiProperty() title: string;
  @ApiProperty({ type: String, nullable: true }) description: string | null;
  @ApiProperty({ example: '2026-09-23', description: 'First day' }) date: string;
  @ApiProperty({ example: '2026-09-25', description: 'Last day (same as date for single-day activities)' }) endDate: string;
  @ApiProperty({ type: String, nullable: true, example: '09:30' }) startTime: string | null;
  @ApiProperty({ type: String, nullable: true, example: '11:00' }) endTime: string | null;
  @ApiProperty() location: string;
  @ApiProperty({ enum: ACTIVITY_STATUSES, description: 'Computed from the date/time — cannot be set directly' })
  status: ActivityStatus;
  @ApiProperty({ type: ProjectRefDto }) project: ProjectRefDto;
  @ApiProperty({ type: StaffRefDto, description: 'The staff member who logged the activity' })
  author: StaffRefDto;
  @ApiProperty({ type: [StaffRefDto], description: 'Additional staff also working on this activity' })
  collaborators: StaffRefDto[];
  @ApiProperty({ type: [PhotoDto] }) photos: PhotoDto[];
  @ApiProperty({ type: String, nullable: true, description: 'Recorded once the activity is completed' })
  outcome: string | null;
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

  @ApiProperty({ example: '2026-09-23', description: 'First day, YYYY-MM-DD' })
  @Matches(ISO_DATE, { message: 'date must be in YYYY-MM-DD format' })
  date: string;

  @ApiPropertyOptional({
    example: '2026-09-25',
    description: `Last day for multi-day activities, YYYY-MM-DD; omit or match date for a single day (at most ${MAX_ACTIVITY_DAYS} days)`,
  })
  @IsOptional()
  @Matches(ISO_DATE, { message: 'endDate must be in YYYY-MM-DD format' })
  endDate?: string;

  @ApiPropertyOptional({ example: '09:30', description: 'HH:mm on the first day' })
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'startTime must be in HH:mm format' })
  startTime?: string;

  @ApiPropertyOptional({ example: '11:00', description: 'HH:mm on the last day; must be after startTime for single-day activities' })
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'endTime must be in HH:mm format' })
  endTime?: string;

  @ApiProperty({ example: 'Kigali, Gasabo District' })
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  location: string;

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

  @ApiPropertyOptional({
    type: [String],
    description: 'A short caption for each photo, in the same order as the files (use an empty string to leave one blank)',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(160, { each: true })
  captions?: string[];
}

export class CreateActivityWithPhotosDto extends CreateActivityDto {
  @ApiPropertyOptional({ type: 'array', items: { type: 'string', format: 'binary' }, description: 'Up to 6 images, 5 MB each' })
  photos?: unknown[];
}

export class UpdateActivityDto extends PartialType(CreateActivityDto) {}

export class AddActivityPhotosDto {
  @ApiProperty({ type: 'array', items: { type: 'string', format: 'binary' }, description: 'One or more images, 5 MB each' })
  photos: unknown[];

  @ApiPropertyOptional({
    type: [String],
    description: 'A short caption for each photo, in the same order as the files (use an empty string to leave one blank)',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(160, { each: true })
  captions?: string[];
}

export class SetActivityOutcomeDto {
  @ApiProperty({
    example: 'Reached 28 participants; four new savings groups formed as a direct result.',
    description: 'What came out of the activity — only recordable once it is completed',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(2000)
  outcome: string;
}

export class DateRangeQueryDto {
  @ApiProperty({ example: '2026-09-21' })
  @Matches(ISO_DATE, { message: 'from must be in YYYY-MM-DD format' })
  from: string;

  @ApiProperty({ example: '2026-09-27' })
  @Matches(ISO_DATE, { message: 'to must be in YYYY-MM-DD format' })
  to: string;
}
