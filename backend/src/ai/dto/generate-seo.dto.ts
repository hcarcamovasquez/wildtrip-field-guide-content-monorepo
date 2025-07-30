import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class GenerateNewsSEODto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  summary: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}

export class GenerateSpeciesSEODto {
  @IsString()
  @IsNotEmpty()
  commonName: string;

  @IsString()
  @IsNotEmpty()
  scientificName: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  habitat?: string;

  @IsString()
  @IsOptional()
  conservationStatus?: string;
}

export class GenerateProtectedAreaSEODto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  region?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  keyFeatures?: string[];
}