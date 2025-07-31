import { IsString, IsOptional, IsEnum, IsArray, IsObject } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateSpeciesDto {
  @IsString()
  scientificName: string;

  @IsString()
  commonName: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  family?: string;

  @IsOptional()
  @IsString()
  order?: string;

  @IsOptional()
  @IsString()
  class?: string;

  @IsOptional()
  @IsString()
  phylum?: string;

  @IsOptional()
  @IsString()
  kingdom?: string;

  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsEnum([
    'mammal',
    'bird',
    'reptile',
    'amphibian',
    'fish',
    'insect',
    'arachnid',
    'crustacean',
    'mollusk',
    'plant',
    'fungus',
    'algae',
    'other',
  ])
  mainGroup?: string;

  @IsOptional()
  @IsString()
  specificCategory?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  habitat?: string;

  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsEnum([
    'extinct',
    'extinct_in_wild',
    'critically_endangered',
    'endangered',
    'vulnerable',
    'near_threatened',
    'least_concern',
    'data_deficient',
    'not_evaluated',
  ], { message: 'conservationStatus must be a valid conservation status or omitted' })
  conservationStatus?: string;

  @IsOptional()
  @IsString()
  distinctiveFeatures?: string;

  @IsOptional()
  @IsArray()
  references?: { title: string; url: string }[];

  @IsOptional()
  @IsObject()
  richContent?: any;

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
}