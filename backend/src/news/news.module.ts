import { Module } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { NewsRepository } from './news.repository';
import { LocksModule } from '../locks/locks.module';

@Module({
  imports: [LocksModule],
  controllers: [NewsController],
  providers: [NewsService, NewsRepository],
  exports: [NewsService],
})
export class NewsModule {}
