import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsObject,
  IsNotEmpty,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import type { RichContent } from '@wildtrip/shared';

export class CreateProtectedAreaDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsEnum([
    'national_park',
    'national_reserve',
    'natural_monument',
    'nature_sanctuary',
  ])
  type?: string;

  @IsOptional()
  @IsObject()
  location?: any; // GeoJSON data

  @IsOptional()
  @IsNumber()
  area?: number; // In hectares

  @IsOptional()
  @IsNumber()
  creationYear?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ecosystems?: string[];

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  keySpecies?: number[];

  @IsOptional()
  @IsObject()
  visitorInformation?: {
    schedule?: string;
    contact?: string;
    entranceFee?: string;
    facilities?: string[];
  };

  @IsOptional()
  @IsObject()
  mainImage?: {
    id: string;
    url: string;
    galleryId: number;
  };

  @IsOptional()
  @IsArray()
  galleryImages?: Array<{
    id: string;
    url: string;
    galleryId: number;
  }>;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsObject()
  richContent?: RichContent;

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
