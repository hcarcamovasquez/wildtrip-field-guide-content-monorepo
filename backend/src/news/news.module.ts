import { Module } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { NewsPublicController, NewsPreviewController } from './news-public.controller';
import { NewsRepository } from './news.repository';
import { LocksModule } from '../locks/locks.module';

@Module({
  imports: [LocksModule],
  controllers: [NewsController, NewsPublicController, NewsPreviewController],
  providers: [NewsService, NewsRepository],
  exports: [NewsService],
})
export class NewsModule {}
