import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AIService } from './ai.service';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  GenerateNewsSEODto,
  GenerateSpeciesSEODto,
  GenerateProtectedAreaSEODto,
} from './dto/generate-seo.dto';

@Controller('api/ai')
@UseGuards(ClerkAuthGuard, RolesGuard)
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('generate-seo/news')
  @Roles('admin', 'content_editor', 'news_editor')
  async generateNewsSEO(@Body() dto: GenerateNewsSEODto) {
    return this.aiService.generateNewsSEO(dto.title, dto.summary, dto.content);
  }

  @Post('generate-seo/species')
  @Roles('admin', 'content_editor', 'species_editor')
  async generateSpeciesSEO(@Body() dto: GenerateSpeciesSEODto) {
    return this.aiService.generateSpeciesSEO(
      dto.commonName,
      dto.scientificName,
      dto.description,
      dto.habitat,
      dto.conservationStatus,
    );
  }

  @Post('generate-seo/protected-areas')
  @Roles('admin', 'content_editor', 'areas_editor')
  async generateProtectedAreaSEO(@Body() dto: GenerateProtectedAreaSEODto) {
    return this.aiService.generateProtectedAreaSEO(
      dto.name,
      dto.type,
      dto.description,
      dto.region,
      dto.keyFeatures,
    );
  }
}