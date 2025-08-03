import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { NewsService } from './news.service';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';

@Controller('api/public/news')
export class NewsPublicController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  findAll(@Query() query: any) {
    // Only return published news for public endpoints
    return this.newsService.findAll({ ...query, status: 'published' });
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.newsService.findBySlug(slug);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.newsService.findOne(+id);
  }
}

// Preview endpoints with authentication
@Controller('api/preview/news')
export class NewsPreviewController {
  constructor(private readonly newsService: NewsService) {}

  @Get(':id')
  @UseGuards(ClerkAuthGuard)
  previewOne(@Param('id') id: string) {
    // This will return the draft version if it exists
    return this.newsService.findOne(+id, true);
  }
}
