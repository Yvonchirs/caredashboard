import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class ProjectDto {
  @ApiProperty() id: number;
  @ApiProperty() name: string;
  @ApiProperty() code: string;
  @ApiProperty({ type: String, nullable: true }) description: string | null;
  @ApiProperty({ type: String, nullable: true }) location: string | null;
  @ApiProperty() isActive: boolean;
  @ApiProperty() memberCount: number;
  @ApiProperty() createdAt: Date;
}

export class CreateProjectDto {
  @ApiProperty({ example: 'Women Economic Empowerment' })
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  name: string;

  @ApiProperty({ example: 'WEE', description: 'Short unique code, 2–12 letters, digits or dashes' })
  @Matches(/^[A-Za-z0-9-]{2,12}$/)
  code: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ example: 'Nyamagabe, Southern Province' })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  location?: string;
}

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
