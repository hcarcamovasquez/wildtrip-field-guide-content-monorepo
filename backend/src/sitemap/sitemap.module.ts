import { Module } from '@nestjs/common';
import { SitemapController } from './sitemap.controller';
import { SitemapService } from './sitemap.service';
import { SpeciesModule } from '../species/species.module';
import { NewsModule } from '../news/news.module';
import { ProtectedAreasModule } from '../protected-areas/protected-areas.module';

@Module({
  imports: [SpeciesModule, NewsModule, ProtectedAreasModule],
  controllers: [SitemapController],
  providers: [SitemapService],
})
export class SitemapModule {}
