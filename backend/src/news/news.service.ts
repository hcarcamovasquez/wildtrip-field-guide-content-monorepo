import { Injectable, NotFoundException } from '@nestjs/common';
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
    if (updateNewsDto.title && !updateNewsDto.slug) {
      (updateNewsDto as any).slug = slugify(updateNewsDto.title);
    }
    
    return this.newsRepository.update(id, updateNewsDto);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.newsRepository.delete(id);
  }

  async publish(id: number) {
    const article = await this.findOne(id);
    
    if (article.hasDraft && article.draftData) {
      // Apply draft changes before publishing
      await this.newsRepository.update(id, article.draftData);
    }
    
    return this.newsRepository.publish(id);
  }

  async createDraft(id: number, draftData: UpdateNewsDto) {
    await this.findOne(id);
    return this.newsRepository.createDraft(id, draftData);
  }

  async discardDraft(id: number) {
    await this.findOne(id);
    return this.newsRepository.discardDraft(id);
  }
}