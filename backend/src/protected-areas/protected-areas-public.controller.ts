import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ProtectedAreasService } from './protected-areas.service';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';

@Controller('api/public/protected-areas')
export class ProtectedAreasPublicController {
  constructor(private readonly protectedAreasService: ProtectedAreasService) {}

  @Get()
  findAll(@Query() query: any) {
    // Only return published protected areas for public endpoints
    return this.protectedAreasService.findAll({
      ...query,
      status: 'published',
    });
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.protectedAreasService.findBySlug(slug);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.protectedAreasService.findOne(+id);
  }
}

// Preview endpoints with authentication
@Controller('api/preview/protected-areas')
export class ProtectedAreasPreviewController {
  constructor(private readonly protectedAreasService: ProtectedAreasService) {}

  @Get(':id')
  @UseGuards(ClerkAuthGuard)
  previewOne(@Param('id') id: string) {
    // This will return the draft version if it exists
    return this.protectedAreasService.findOne(+id, true);
  }
}
