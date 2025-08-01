import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { NewsRepository } from './news.repository';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { slugify } from '@wildtrip/shared';

@Injectable()
export class NewsService {
  constructor(private newsRepository: NewsRepository) {}

  async findAll(query: any) {
    return this.newsRepository.findAll(query);
  }

  async findOne(id: number) {
    const article = await this.newsRepository.findById(id);
    if (!article) {
      throw new NotFoundException(`News article with ID ${id} not found`);
    }
    return article;
  }

  async findBySlug(slug: string) {
    const article = await this.newsRepository.findBySlug(slug);
    if (!article) {
      throw new NotFoundException(`News article with slug ${slug} not found`);
    }
    return article;
  }

  async create(createNewsDto: CreateNewsDto, userId?: string) {
    // Generate slug from title
    const slug = createNewsDto.slug || slugify(createNewsDto.title);
    
    return this.newsRepository.create({
      ...createNewsDto,
      slug,
      status: createNewsDto.status || 'draft',
      publishedAt: createNewsDto.status === 'published' ? new Date() : null,
    });
  }

  async update(id: number, updateNewsDto: UpdateNewsDto) {
    const article = await this.findOne(id);
    
    // Update slug if title changed
    const updateData: any = { ...updateNewsDto };
    if ('title' in updateData && updateData.title && !('slug' in updateData)) {
      updateData.slug = slugify(updateData.title);
    }
    
    return this.newsRepository.update(id, updateData);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.newsRepository.delete(id);
  }

  async publish(id: number) {
    try {
      return await this.newsRepository.publish(id);
    } catch (error) {
      if (error.message === 'News not found') {
        throw new NotFoundException('News article not found');
      }
      if (error.message === 'Nothing to publish') {
        throw new BadRequestException('News article is already published and has no pending changes');
      }
      throw error;
    }
  }

  async createDraft(id: number, draftData: UpdateNewsDto) {
    await this.findOne(id);
    return this.newsRepository.createDraft(id, draftData);
  }

  async discardDraft(id: number) {
    const article = await this.findOne(id);
    if (!article.draftData) {
      throw new NotFoundException('No draft content to discard');
    }
    return this.newsRepository.discardDraft(id);
  }
}