import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard.js';
import { CurrentUser } from '../common/current-user.decorator.js';
import type { User } from '../entities/index.js';
import {
  ActivityDto,
  CreateActivityDto,
  CreateActivityWithPhotosDto,
  DateRangeQueryDto,
  UpdateActivityDto,
} from './activities.dto.js';
import { ActivitiesService } from './activities.service.js';
import { MAX_PHOTOS, photoUploadOptions } from './upload.config.js';

@ApiTags('Activities')
@ApiBearerAuth()
@Controller('activities')
@UseGuards(AuthGuard)
export class ActivitiesController {
  constructor(private readonly activities: ActivitiesService) {}

  @Get('mine')
  @ApiOperation({ summary: "Current user's activities within a date range" })
  @ApiOkResponse({ type: [ActivityDto] })
  findMine(@CurrentUser() user: User, @Query() query: DateRangeQueryDto) {
    return this.activities.findMine(user, query.from, query.to);
  }

  @Post()
  @UseInterceptors(FilesInterceptor('photos', MAX_PHOTOS, photoUploadOptions))
  @ApiOperation({ summary: 'Log an activity for a project, with optional photos' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateActivityWithPhotosDto })
  @ApiCreatedResponse({ type: ActivityDto })
  create(
    @CurrentUser() user: User,
    @Body() dto: CreateActivityDto,
    @UploadedFiles() files: Express.Multer.File[] = [],
  ) {
    return this.activities.create(user, dto, files);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an activity (author or admin)' })
  @ApiOkResponse({ type: ActivityDto })
  update(@CurrentUser() user: User, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateActivityDto) {
    return this.activities.update(user, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete an activity and its photos (author or admin)' })
  @ApiNoContentResponse()
  remove(@CurrentUser() user: User, @Param('id', ParseIntPipe) id: number) {
    return this.activities.remove(user, id);
  }
}
