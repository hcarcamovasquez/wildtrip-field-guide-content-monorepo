import { Injectable, NotFoundException } from '@nestjs/common';
import { SpeciesRepository } from './species.repository';
import { CreateSpeciesDto } from './dto/create-species.dto';
import { UpdateSpeciesDto } from './dto/update-species.dto';
import { slugify } from '@wildtrip/shared';

@Injectable()
export class SpeciesService {
  constructor(private speciesRepository: SpeciesRepository) {}

  async findAll(query: any) {
    return this.speciesRepository.findAll(query);
  }

  async findOne(id: number) {
    const species = await this.speciesRepository.findById(id);
    if (!species) {
      throw new NotFoundException(`Species with ID ${id} not found`);
    }
    return species;
  }

  async findBySlug(slug: string) {
    const species = await this.speciesRepository.findBySlug(slug);
    if (!species) {
      throw new NotFoundException(`Species with slug ${slug} not found`);
    }
    return species;
  }

  async create(createSpeciesDto: CreateSpeciesDto) {
    // Generate slug from common name
    const slug = createSpeciesDto.slug || slugify(createSpeciesDto.commonName);
    
    return this.speciesRepository.create({
      ...createSpeciesDto,
      slug,
    });
  }

  async update(id: number, updateSpeciesDto: UpdateSpeciesDto) {
    const species = await this.findOne(id);
    
    // Update slug if common name changed
    if (updateSpeciesDto.commonName && !updateSpeciesDto.slug) {
      updateSpeciesDto.slug = slugify(updateSpeciesDto.commonName);
    }
    
    return this.speciesRepository.update(id, updateSpeciesDto);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.speciesRepository.delete(id);
  }

  async publish(id: number) {
    const species = await this.findOne(id);
    if (!species.draftData) {
      throw new NotFoundException('No draft content to publish');
    }
    return this.speciesRepository.publish(id);
  }

  async createDraft(id: number, draftData: UpdateSpeciesDto) {
    await this.findOne(id);
    
    // Update slug if common name changed
    if (draftData.commonName && !draftData.slug) {
      draftData.slug = slugify(draftData.commonName);
    }
    
    return this.speciesRepository.createDraft(id, draftData);
  }

  async discardDraft(id: number) {
    const species = await this.findOne(id);
    if (!species.draftData) {
      throw new NotFoundException('No draft content to discard');
    }
    return this.speciesRepository.discardDraft(id);
  }
}