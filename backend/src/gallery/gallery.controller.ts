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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GalleryService } from './gallery.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { UploadFileDto } from './dto/upload-file.dto';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, ICurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('api/gallery')
@UseGuards(ClerkAuthGuard, RolesGuard)
@Roles('admin', 'content_editor', 'news_editor', 'areas_editor', 'species_editor')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  // Media endpoints
  @Get('browse')
  browseMedia(@Query() query: any) {
    // Convert numeric parameters
    const params = {
      ...query,
      page: query.page ? parseInt(query.page, 10) : undefined,
      limit: query.limit ? parseInt(query.limit, 10) : undefined,
      folderId: query.folderId !== undefined ? 
        (query.folderId === 'null' || query.folderId === null ? null : parseInt(query.folderId, 10)) : 
        undefined,
    };
    return this.galleryService.findAllMedia(params);
  }

  @Get('images')
  browseImages(@Query() query: any) {
    // Convert numeric parameters for images-only view
    const params = {
      ...query,
      page: query.page ? parseInt(query.page, 10) : undefined,
      limit: query.limit ? parseInt(query.limit, 10) : undefined,
    };
    return this.galleryService.findImagesOnly(params);
  }

  @Get('by-ids')
  getMediaByIds(@Query('ids') ids: string) {
    if (!ids) {
      throw new BadRequestException('ids parameter is required');
    }
    const idArray = ids.split(',').map(id => parseInt(id, 10));
    return this.galleryService.findMediaByIds(idArray);
  }

  @Get('media/:id')
  getMedia(@Param('id') id: string) {
    return this.galleryService.findMediaById(+id);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadFileDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    
    return this.galleryService.uploadFile(
      file,
      uploadDto,
      user.id,
      `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
    );
  }

  @Post('upload-chunk')
  @UseInterceptors(FileInterceptor('chunk'))
  uploadChunk(
    @UploadedFile() chunk: Express.Multer.File,
    @Body() chunkData: any,
    @CurrentUser() user: ICurrentUser,
  ) {
    if (!chunk) {
      throw new BadRequestException('No chunk provided');
    }
    
    return this.galleryService.uploadChunk(
      chunk,
      chunkData,
      user.id,
    );
  }

  @Post('upload-complete')
  completeUpload(
    @Body() completeData: any,
    @CurrentUser() user: ICurrentUser,
  ) {
    return this.galleryService.completeChunkedUpload(
      completeData,
      user.id,
      `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
    );
  }

  @Patch('media/:id')
  updateMedia(@Param('id') id: string, @Body() updateData: any) {
    return this.galleryService.updateMedia(+id, updateData);
  }

  @Delete('media/:id')
  deleteMedia(@Param('id') id: string) {
    return this.galleryService.deleteMedia(+id);
  }

  @Post('media/batch-delete')
  deleteMediaBatch(@Body('ids') ids: number[]) {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new BadRequestException('ids array is required');
    }
    return this.galleryService.deleteMediaBatch(ids);
  }

  @Post('media/move')
  moveMedia(@Body() body: { mediaIds: number[]; folderId: number | null }) {
    const { mediaIds, folderId } = body;
    if (!mediaIds || !Array.isArray(mediaIds) || mediaIds.length === 0) {
      throw new BadRequestException('mediaIds array is required');
    }
    return this.galleryService.moveMediaToFolder(mediaIds, folderId);
  }

  // Folder endpoints
  @Get('folders')
  getFolders() {
    return this.galleryService.findAllFolders();
  }

  @Get('folders/:id')
  getFolder(@Param('id') id: string) {
    return this.galleryService.findFolderById(+id);
  }

  @Post('folders')
  createFolder(
    @Body() createFolderDto: CreateFolderDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    return this.galleryService.createFolder(
      createFolderDto,
      user.id,
      `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
    );
  }

  @Patch('folders/:id')
  updateFolder(
    @Param('id') id: string,
    @Body() updateFolderDto: UpdateFolderDto,
  ) {
    return this.galleryService.updateFolder(+id, updateFolderDto);
  }

  @Delete('folders/:id')
  @Roles('admin')
  deleteFolder(@Param('id') id: string) {
    return this.galleryService.deleteFolder(+id);
  }
}