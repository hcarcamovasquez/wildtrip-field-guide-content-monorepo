import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { SpeciesService } from './species.service';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';

@Controller('api/public/species')
export class SpeciesPublicController {
  constructor(private readonly speciesService: SpeciesService) {}

  @Get()
  findAll(@Query() query: any) {
    // Only return published species for public endpoints
    return this.speciesService.findAll({ ...query, status: 'published' });
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.speciesService.findBySlug(slug);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.speciesService.findOne(+id);
  }
}

// Preview endpoints with authentication
@Controller('api/preview/species')
export class SpeciesPreviewController {
  constructor(private readonly speciesService: SpeciesService) {}

  @Get(':id')
  @UseGuards(ClerkAuthGuard)
  previewOne(@Param('id') id: string) {
    // This will return the draft version if it exists
    return this.speciesService.findOne(+id, true);
  }
}