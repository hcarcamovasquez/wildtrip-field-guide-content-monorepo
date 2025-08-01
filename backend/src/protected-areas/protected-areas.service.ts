import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
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
    const slug =
      createProtectedAreaDto.slug || slugify(createProtectedAreaDto.name);

    return this.protectedAreasRepository.create({
      ...createProtectedAreaDto,
      slug,
      status: createProtectedAreaDto.status || 'draft',
      publishedAt:
        createProtectedAreaDto.status === 'published' ? new Date() : null,
    });
  }

  async update(id: number, updateProtectedAreaDto: UpdateProtectedAreaDto) {
    const area = await this.findOne(id);

    // Update slug if name changed
    const updateData: any = { ...updateProtectedAreaDto };
    if ('name' in updateData && updateData.name && !('slug' in updateData)) {
      updateData.slug = slugify(updateData.name);
    }

    return this.protectedAreasRepository.update(id, updateData);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.protectedAreasRepository.delete(id);
  }

  async publish(id: number) {
    try {
      return await this.protectedAreasRepository.publish(id);
    } catch (error) {
      if (error.message === 'Protected area not found') {
        throw new NotFoundException('Protected area not found');
      }
      if (error.message === 'Nothing to publish') {
        throw new BadRequestException(
          'Protected area is already published and has no pending changes',
        );
      }
      throw error;
    }
  }

  async createDraft(id: number, draftData: UpdateProtectedAreaDto) {
    await this.findOne(id);
    return this.protectedAreasRepository.createDraft(id, draftData);
  }

  async discardDraft(id: number) {
    const area = await this.findOne(id);
    if (!area.draftData) {
      throw new NotFoundException('No draft content to discard');
    }
    return this.protectedAreasRepository.discardDraft(id);
  }
}
