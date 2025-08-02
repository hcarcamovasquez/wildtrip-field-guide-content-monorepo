import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  CurrentUser,
  ICurrentUser,
} from '../auth/decorators/current-user.decorator';
import { LocksService } from '../locks/locks.service';

@Controller('api/news')
@UseGuards(ClerkAuthGuard, RolesGuard)
export class NewsController {
  constructor(
    private readonly newsService: NewsService,
    private readonly locksService: LocksService,
  ) {}

  // Protected endpoints - All require authentication
  @Get()
  @Roles('admin', 'content_editor', 'news_editor', 'species_editor', 'areas_editor', 'user')
  findAll(@Query() query: any) {
    return this.newsService.findAll(query);
  }

  @Get('slug/:slug')
  @Roles('admin', 'content_editor', 'news_editor', 'species_editor', 'areas_editor', 'user')
  findBySlug(@Param('slug') slug: string) {
    return this.newsService.findBySlug(slug);
  }

  @Get(':id')
  @Roles('admin', 'content_editor', 'news_editor', 'species_editor', 'areas_editor', 'user')
  findOne(@Param('id') id: string) {
    return this.newsService.findOne(+id);
  }

  @Post()
  @Roles('admin', 'content_editor', 'news_editor')
  create(
    @Body() createNewsDto: CreateNewsDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    return this.newsService.create(createNewsDto, user.id);
  }

  @Patch(':id')
  @Roles('admin', 'content_editor', 'news_editor')
  update(@Param('id') id: string, @Body() updateNewsDto: UpdateNewsDto) {
    return this.newsService.update(+id, updateNewsDto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.newsService.remove(+id);
  }

  // Draft/Publish endpoints
  @Post(':id/publish')
  @Roles('admin', 'content_editor', 'news_editor')
  publish(@Param('id') id: string) {
    return this.newsService.publish(+id);
  }

  @Post(':id/draft')
  @Roles('admin', 'content_editor', 'news_editor')
  createDraft(@Param('id') id: string, @Body() draftData: UpdateNewsDto) {
    return this.newsService.createDraft(+id, draftData);
  }

  @Post(':id/discard-draft')
  @Roles('admin', 'content_editor', 'news_editor')
  discardDraft(@Param('id') id: string) {
    return this.newsService.discardDraft(+id);
  }

  // Lock endpoints
  @Post(':id/lock')
  @Roles('admin', 'content_editor', 'news_editor')
  async acquireLock(
    @Param('id') id: string,
    @CurrentUser() user: ICurrentUser,
  ) {
    const userId = Number((user as any).dbUserId);
    await this.locksService.acquireLock('news', +id, userId);
    return { success: true };
  }

  @Delete(':id/lock')
  @Roles('admin', 'content_editor', 'news_editor')
  async releaseLock(
    @Param('id') id: string,
    @CurrentUser() user: ICurrentUser,
  ) {
    const userId = Number((user as any).dbUserId);
    await this.locksService.releaseLock('news', +id, userId);
    return { success: true };
  }

  @Get(':id/lock')
  @Roles('admin', 'content_editor', 'news_editor')
  async checkLock(@Param('id') id: string) {
    return this.locksService.checkLock('news', +id);
  }
}
