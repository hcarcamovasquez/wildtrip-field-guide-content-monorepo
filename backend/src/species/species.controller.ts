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
import { SpeciesService } from './species.service';
import { CreateSpeciesDto } from './dto/create-species.dto';
import { UpdateSpeciesDto } from './dto/update-species.dto';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  CurrentUser,
  ICurrentUser,
} from '../auth/decorators/current-user.decorator';
import { LocksService } from '../locks/locks.service';

@Controller('api/species')
@UseGuards(ClerkAuthGuard, RolesGuard)
export class SpeciesController {
  constructor(
    private readonly speciesService: SpeciesService,
    private readonly locksService: LocksService,
  ) {}

  // Protected endpoints - All require authentication
  @Get()
  @Roles(
    'admin',
    'content_editor',
    'species_editor',
    'news_editor',
    'areas_editor',
    'user',
  )
  findAll(@Query() query: any) {
    return this.speciesService.findAll(query);
  }

  @Get('slug/:slug')
  @Roles(
    'admin',
    'content_editor',
    'species_editor',
    'news_editor',
    'areas_editor',
    'user',
  )
  findBySlug(@Param('slug') slug: string) {
    return this.speciesService.findBySlug(slug);
  }

  @Get(':id')
  @Roles(
    'admin',
    'content_editor',
    'species_editor',
    'news_editor',
    'areas_editor',
    'user',
  )
  findOne(@Param('id') id: string) {
    return this.speciesService.findOne(+id);
  }

  @Post()
  @Roles('admin', 'content_editor', 'species_editor')
  create(@Body() createSpeciesDto: CreateSpeciesDto) {
    return this.speciesService.create(createSpeciesDto);
  }

  @Patch(':id')
  @Roles('admin', 'content_editor', 'species_editor')
  update(@Param('id') id: string, @Body() updateSpeciesDto: UpdateSpeciesDto) {
    return this.speciesService.update(+id, updateSpeciesDto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.speciesService.remove(+id);
  }

  // Draft/Publish endpoints
  @Post(':id/publish')
  @Roles('admin', 'content_editor', 'species_editor')
  publish(@Param('id') id: string) {
    console.log('Species publish endpoint called for id:', id);
    return this.speciesService.publish(+id);
  }

  @Post(':id/draft')
  @Roles('admin', 'content_editor', 'species_editor')
  createDraft(@Param('id') id: string, @Body() draftData: UpdateSpeciesDto) {
    return this.speciesService.createDraft(+id, draftData);
  }

  @Post(':id/discard-draft')
  @Roles('admin', 'content_editor', 'species_editor')
  discardDraft(@Param('id') id: string) {
    console.log('Discard draft endpoint called for species:', id);
    return this.speciesService.discardDraft(+id);
  }

  // Lock endpoints
  @Post(':id/lock')
  @Roles('admin', 'content_editor', 'species_editor')
  async acquireLock(
    @Param('id') id: string,
    @CurrentUser() user: ICurrentUser,
  ) {
    const userId = Number((user as any).dbUserId);
    await this.locksService.acquireLock('species', +id, userId);
    return { success: true };
  }

  @Delete(':id/lock')
  @Roles('admin', 'content_editor', 'species_editor')
  async releaseLock(
    @Param('id') id: string,
    @CurrentUser() user: ICurrentUser,
  ) {
    console.log('Release lock endpoint called for species:', id);
    const userId = Number((user as any).dbUserId);
    await this.locksService.releaseLock('species', +id, userId);
    return { success: true };
  }

  @Get(':id/lock')
  @Roles('admin', 'content_editor', 'species_editor')
  async checkLock(@Param('id') id: string) {
    return this.locksService.checkLock('species', +id);
  }
}
