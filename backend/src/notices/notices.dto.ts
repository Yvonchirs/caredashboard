import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { ISO_DATE } from '../common/date.util.js';
import { NOTICE_KINDS, NOTICE_RECURRENCES, type NoticeKind, type NoticeRecurrence } from '../entities/index.js';
import { StaffRefDto } from '../users/users.dto.js';

export class NoticeDto {
  @ApiProperty() id: number;
  @ApiProperty({ enum: NOTICE_KINDS }) kind: NoticeKind;
  @ApiProperty() title: string;
  @ApiProperty({ type: String, nullable: true }) details: string | null;
  @ApiProperty({ example: '2026-10-08', description: 'For recurring deadlines, the date of this occurrence' })
  date: string;
  @ApiProperty({ type: String, nullable: true, example: '17:00', description: 'Due time (deadlines only)' })
  time: string | null;
  @ApiProperty({ enum: NOTICE_RECURRENCES, nullable: true, description: 'Repeat pattern (deadlines only)' })
  recurrence: NoticeRecurrence | null;
  @ApiProperty({ type: String, nullable: true, example: '2027-06-30', description: 'Last day the deadline may repeat on' })
  recurUntil: string | null;
  @ApiProperty({ type: StaffRefDto }) author: StaffRefDto;
  @ApiProperty() createdAt: Date;
}

export class CreateNoticeDto {
  @ApiProperty({ enum: NOTICE_KINDS })
  @IsIn(NOTICE_KINDS)
  kind: NoticeKind;

  @ApiProperty({ example: 'Q3 narrative reports due to M&E' })
  @IsString()
  @MinLength(3)
  @MaxLength(160)
  title: string;

  @ApiPropertyOptional({ example: 'Send to diane@care.org.rw using the new template.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  details?: string;

  @ApiProperty({ example: '2026-10-08', description: 'Day it is shown on the board (the due date for deadlines)' })
  @Matches(ISO_DATE, { message: 'date must be in YYYY-MM-DD format' })
  date: string;

  @ApiPropertyOptional({ example: '17:00', description: 'HH:mm due time, deadlines only' })
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'time must be in HH:mm format' })
  time?: string;

  @ApiPropertyOptional({
    enum: NOTICE_RECURRENCES,
    description: 'Deadlines only: repeat every week, month, quarter or year from the first due date',
  })
  @IsOptional()
  @IsIn(NOTICE_RECURRENCES)
  recurrence?: NoticeRecurrence;

  @ApiPropertyOptional({ example: '2027-06-30', description: 'Last day a recurring deadline may fall on; omit to repeat indefinitely' })
  @IsOptional()
  @Matches(ISO_DATE, { message: 'recurUntil must be in YYYY-MM-DD format' })
  recurUntil?: string;
}
