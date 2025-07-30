import { Injectable, NotFoundException } from '@nestjs/common';
import { ProtectedAreasRepository } from './protected-areas.repository';
import { CreateProtectedAreaDto } from './dto/create-protected-area.dto';
import { UpdateProtectedAreaDto } from './dto/update-protected-area.dto';
import { slugify } from '@wildtrip/shared';

@Injectable()
export class ProtectedAreasService {
  constructor(private protectedAreasRepository: ProtectedAreasRepository) {}

  async findAll(query: any) {
    return this.protectedAreasRepository.findAll(query);
  }

  async findOne(id: number) {
    const area = await this.protectedAreasRepository.findById(id);
    if (!area) {
      throw new NotFoundException(`Protected area with ID ${id} not found`);
    }
    return area;
  }

  async findBySlug(slug: string) {
    const area = await this.protectedAreasRepository.findBySlug(slug);
    if (!area) {
      throw new NotFoundException(`Protected area with slug ${slug} not found`);
    }
    return area;
  }

  async create(createProtectedAreaDto: CreateProtectedAreaDto) {
    // Generate slug from name
    const slug = createProtectedAreaDto.slug || slugify(createProtectedAreaDto.name);
    
    return this.protectedAreasRepository.create({
      ...createProtectedAreaDto,
      slug,
      status: createProtectedAreaDto.status || 'draft',
      publishedAt: createProtectedAreaDto.status === 'published' ? new Date() : null,
    });
  }

  async update(id: number, updateProtectedAreaDto: UpdateProtectedAreaDto) {
    const area = await this.findOne(id);
    
    // Update slug if name changed
    if (updateProtectedAreaDto.name && !updateProtectedAreaDto.slug) {
      updateProtectedAreaDto.slug = slugify(updateProtectedAreaDto.name);
    }
    
    return this.protectedAreasRepository.update(id, updateProtectedAreaDto);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.protectedAreasRepository.delete(id);
  }

  async publish(id: number) {
    const area = await this.findOne(id);
    
    if (area.hasDraft && area.draftData) {
      // Apply draft changes before publishing
      await this.protectedAreasRepository.update(id, area.draftData);
    }
    
    return this.protectedAreasRepository.publish(id);
  }

  async createDraft(id: number, draftData: UpdateProtectedAreaDto) {
    await this.findOne(id);
    return this.protectedAreasRepository.createDraft(id, draftData);
  }

  async discardDraft(id: number) {
    await this.findOne(id);
    return this.protectedAreasRepository.discardDraft(id);
  }
}