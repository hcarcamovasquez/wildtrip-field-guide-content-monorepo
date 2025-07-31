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
import { ProtectedAreasService } from './protected-areas.service';
import { CreateProtectedAreaDto } from './dto/create-protected-area.dto';
import { UpdateProtectedAreaDto } from './dto/update-protected-area.dto';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, ICurrentUser } from '../auth/decorators/current-user.decorator';
import { LocksService } from '../locks/locks.service';

@Controller('api/protected-areas')
export class ProtectedAreasController {
  constructor(
    private readonly protectedAreasService: ProtectedAreasService,
    private readonly locksService: LocksService,
  ) {}

  // Public endpoints
  @Get()
  findAll(@Query() query: any) {
    return this.protectedAreasService.findAll(query);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.protectedAreasService.findBySlug(slug);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.protectedAreasService.findOne(+id);
  }

  // Protected endpoints - Management API
  @Post()
  @UseGuards(ClerkAuthGuard, RolesGuard)
  @Roles('admin', 'content_editor', 'areas_editor')
  create(@Body() createProtectedAreaDto: CreateProtectedAreaDto) {
    return this.protectedAreasService.create(createProtectedAreaDto);
  }

  @Patch(':id')
  @UseGuards(ClerkAuthGuard, RolesGuard)
  @Roles('admin', 'content_editor', 'areas_editor')
  update(@Param('id') id: string, @Body() updateProtectedAreaDto: UpdateProtectedAreaDto) {
    return this.protectedAreasService.update(+id, updateProtectedAreaDto);
  }

  @Delete(':id')
  @UseGuards(ClerkAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.protectedAreasService.remove(+id);
  }

  // Draft/Publish endpoints
  @Post(':id/publish')
  @UseGuards(ClerkAuthGuard, RolesGuard)
  @Roles('admin', 'content_editor', 'areas_editor')
  publish(@Param('id') id: string) {
    return this.protectedAreasService.publish(+id);
  }

  @Post(':id/draft')
  @UseGuards(ClerkAuthGuard, RolesGuard)
  @Roles('admin', 'content_editor', 'areas_editor')
  createDraft(@Param('id') id: string, @Body() draftData: UpdateProtectedAreaDto) {
    return this.protectedAreasService.createDraft(+id, draftData);
  }

  @Post(':id/discard-draft')
  @UseGuards(ClerkAuthGuard, RolesGuard)
  @Roles('admin', 'content_editor', 'areas_editor')
  discardDraft(@Param('id') id: string) {
    return this.protectedAreasService.discardDraft(+id);
  }

  // Lock endpoints
  @Post(':id/lock')
  @UseGuards(ClerkAuthGuard, RolesGuard)
  @Roles('admin', 'content_editor', 'areas_editor')
  async acquireLock(@Param('id') id: string, @CurrentUser() user: ICurrentUser) {
    const userId = Number((user as any).dbUserId);
    await this.locksService.acquireLock('protectedAreas', +id, userId);
    return { locked: true };
  }

  @Delete(':id/lock')
  @UseGuards(ClerkAuthGuard, RolesGuard)
  @Roles('admin', 'content_editor', 'areas_editor')
  async releaseLock(@Param('id') id: string, @CurrentUser() user: ICurrentUser) {
    const userId = Number((user as any).dbUserId);
    await this.locksService.releaseLock('protectedAreas', +id, userId);
    return { locked: false };
  }

  @Get(':id/lock')
  async checkLock(@Param('id') id: string) {
    return this.locksService.checkLock('protectedAreas', +id);
  }
}