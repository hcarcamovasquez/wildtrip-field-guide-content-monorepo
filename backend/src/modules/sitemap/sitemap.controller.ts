import { Controller, Get, Header } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { SitemapService } from './sitemap.service';

@Controller()
export class SitemapController {
  constructor(private readonly sitemapService: SitemapService) {}

  @Get('sitemap.xml')
  @Public()
  @Header('Content-Type', 'application/xml')
  @Header('Cache-Control', 'public, max-age=3600') // Cache for 1 hour
  async getSitemap(): Promise<string> {
    return this.sitemapService.generateSitemap();
  }
}
