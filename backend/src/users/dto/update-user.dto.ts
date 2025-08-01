import { IsString, IsOptional, IsIn } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @IsIn([
    'admin',
    'content_editor',
    'news_editor',
    'areas_editor',
    'species_editor',
    'viewer',
  ])
  role?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;
}
