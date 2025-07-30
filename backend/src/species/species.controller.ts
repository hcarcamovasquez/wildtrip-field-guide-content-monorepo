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
import { CurrentUser, ICurrentUser } from '../auth/decorators/current-user.decorator';
import { LocksService } from '../locks/locks.service';

@Controller('api/species')
export class SpeciesController {
  constructor(
    private readonly speciesService: SpeciesService,
    private readonly locksService: LocksService,
  ) {}

  // Public endpoints
  @Get()
  findAll(@Query() query: any) {
    return this.speciesService.findAll(query);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.speciesService.findBySlug(slug);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.speciesService.findOne(+id);
  }

  // Protected endpoints
  @Post()
  @UseGuards(ClerkAuthGuard, RolesGuard)
  @Roles('admin', 'content_editor', 'species_editor')
  create(@Body() createSpeciesDto: CreateSpeciesDto) {
    return this.speciesService.create(createSpeciesDto);
  }

  @Patch(':id')
  @UseGuards(ClerkAuthGuard, RolesGuard)
  @Roles('admin', 'content_editor', 'species_editor')
  update(@Param('id') id: string, @Body() updateSpeciesDto: UpdateSpeciesDto) {
    return this.speciesService.update(+id, updateSpeciesDto);
  }

  @Delete(':id')
  @UseGuards(ClerkAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.speciesService.remove(+id);
  }

  // Lock endpoints
  @Post(':id/lock')
  @UseGuards(ClerkAuthGuard, RolesGuard)
  @Roles('admin', 'content_editor', 'species_editor')
  async acquireLock(@Param('id') id: string, @CurrentUser() user: ICurrentUser) {
    // For now, use a numeric ID - in a real app, you'd use the database user ID
    const userId = 1; // TODO: Get actual DB user ID from user object
    await this.locksService.acquireLock('species', +id, userId);
    return { success: true };
  }

  @Delete(':id/lock')
  @UseGuards(ClerkAuthGuard, RolesGuard)
  @Roles('admin', 'content_editor', 'species_editor')
  async releaseLock(@Param('id') id: string, @CurrentUser() user: ICurrentUser) {
    const userId = 1; // TODO: Get actual DB user ID from user object
    await this.locksService.releaseLock('species', +id, userId);
    return { success: true };
  }

  @Get(':id/lock')
  async checkLock(@Param('id') id: string) {
    return this.locksService.checkLock('species', +id);
  }
}