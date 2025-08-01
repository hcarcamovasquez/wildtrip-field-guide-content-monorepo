import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsObject,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import type { RichContent } from '@wildtrip/shared';

export class CreateNewsDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsEnum(['education', 'current_events', 'conservation', 'research'])
  category: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsObject()
  @IsNotEmpty()
  content: RichContent;

  @IsOptional()
  @IsObject()
  mainImage?: {
    id: string;
    url: string;
    galleryId: number;
  };

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  seoTitle?: string;

  @IsOptional()
  @IsString()
  seoDescription?: string;

  @IsOptional()
  @IsString()
  seoKeywords?: string;

  @IsOptional()
  @IsEnum(['draft', 'published', 'archived'])
  status?: string;
}
