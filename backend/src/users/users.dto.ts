import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { ArrayUnique, IsArray, IsBoolean, IsEmail, IsIn, IsInt, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { USER_ROLES, type UserRole } from '../entities/index.js';

export class ProjectRefDto {
  @ApiProperty() id: number;
  @ApiProperty() name: string;
  @ApiProperty() code: string;
}

export class UserDto {
  @ApiProperty() id: number;
  @ApiProperty() name: string;
  @ApiProperty() email: string;
  @ApiProperty({ enum: USER_ROLES }) role: UserRole;
  @ApiProperty({ type: String, nullable: true }) jobTitle: string | null;
  @ApiProperty() isActive: boolean;
  @ApiProperty() mustChangePassword: boolean;
  @ApiProperty({ type: [ProjectRefDto], description: 'Projects the user may log activities for' })
  projects: ProjectRefDto[];
  @ApiProperty() createdAt: Date;
}

export class CreateUserDto {
  @ApiProperty({ example: 'Aline Uwase' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name: string;

  @ApiProperty({ example: 'aline.uwase@care.org.rw' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: 'Field Officer' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  jobTitle?: string;

  @ApiProperty({ enum: USER_ROLES, default: 'staff' })
  @IsIn(USER_ROLES)
  role: UserRole;

  @ApiPropertyOptional({ type: [Number], description: 'Project ids the user may log activities for' })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  projectIds?: number[];
}

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UserWithPasswordDto {
  @ApiProperty({ type: UserDto }) user: UserDto;
  @ApiProperty({ description: 'One-time password to share with the user. They must change it at first sign-in.' })
  temporaryPassword: string;
}
