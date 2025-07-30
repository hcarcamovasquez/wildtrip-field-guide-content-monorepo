import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { GalleryRepository } from './gallery.repository';
import { R2Service } from '../storage/r2.service';
import { ImageProcessorService } from '../storage/image-processor.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { UploadFileDto } from './dto/upload-file.dto';
import { slugify } from '@wildtrip/shared';

@Injectable()
export class GalleryService {
  constructor(
    private galleryRepository: GalleryRepository,
    private r2Service: R2Service,
    private imageProcessor: ImageProcessorService,
  ) {}

  // Media methods
  async findAllMedia(query: any) {
    return this.galleryRepository.findAllMedia(query);
  }

  async findMediaById(id: number) {
    const media = await this.galleryRepository.findMediaById(id);
    if (!media) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }
    return media;
  }

  async findMediaByIds(ids: number[]) {
    return this.galleryRepository.findMediaByIds(ids);
  }

  async uploadFile(
    file: Express.Multer.File,
    uploadDto: UploadFileDto,
    userId: string,
    userName: string,
  ) {
    // Validate file type
    if (!file.mimetype.startsWith('image/') && !file.mimetype.startsWith('video/')) {
      throw new BadRequestException('Only image and video files are allowed');
    }

    let processedBuffer = file.buffer;
    let width: number | undefined;
    let height: number | undefined;
    let finalMimeType = file.mimetype;

    // Process image if needed
    if (file.mimetype.startsWith('image/')) {
      const processed = await this.imageProcessor.processImage(file.buffer);
      processedBuffer = processed.buffer;
      width = processed.width;
      height = processed.height;
      finalMimeType = `image/${processed.format}`;
    }

    // Get folder info if provided
    let folderPath: string | null = null;
    if (uploadDto.folderId) {
      const folder = await this.galleryRepository.findFolderById(uploadDto.folderId);
      if (folder) {
        folderPath = folder.path;
      }
    }

    // Upload to R2
    const { key, url } = await this.r2Service.uploadFile(
      processedBuffer,
      file.originalname,
      finalMimeType,
      folderPath || undefined,
    );

    // Save to database
    const mediaData = {
      url,
      filename: key.split('/').pop()!,
      originalFilename: file.originalname,
      mimeType: finalMimeType,
      size: processedBuffer.length,
      type: file.mimetype.startsWith('image/') ? 'image' : 'video',
      folderId: uploadDto.folderId || null,
      folderPath,
      width,
      height,
      title: uploadDto.title,
      description: uploadDto.description,
      altText: uploadDto.altText,
      tags: uploadDto.tags || [],
      uploadedBy: userId,
      uploadedByName: userName,
    };

    return this.galleryRepository.createMedia(mediaData);
  }

  async updateMedia(id: number, data: any) {
    await this.findMediaById(id);
    return this.galleryRepository.updateMedia(id, data);
  }

  async deleteMedia(id: number) {
    const media = await this.findMediaById(id);
    
    // Delete from R2
    const key = this.r2Service.getKeyFromUrl(media.url);
    await this.r2Service.deleteFile(key);
    
    // Delete from database
    await this.galleryRepository.deleteMedia(id);
  }

  async deleteMediaBatch(ids: number[]) {
    const mediaItems = await this.galleryRepository.findMediaByIds(ids);
    
    // Delete all files from R2
    await Promise.all(
      mediaItems.map(media => {
        const key = this.r2Service.getKeyFromUrl(media.url);
        return this.r2Service.deleteFile(key);
      })
    );
    
    // Delete from database
    await this.galleryRepository.deleteMediaBatch(ids);
  }

  async moveMediaToFolder(mediaIds: number[], folderId: number | null) {
    await this.galleryRepository.moveMediaToFolder(mediaIds, folderId);
  }

  // Folder methods
  async findAllFolders() {
    return this.galleryRepository.findAllFolders();
  }

  async findFolderById(id: number) {
    const folder = await this.galleryRepository.findFolderById(id);
    if (!folder) {
      throw new NotFoundException(`Folder with ID ${id} not found`);
    }
    return folder;
  }

  async createFolder(createFolderDto: CreateFolderDto, userId: string, userName: string) {
    const slug = createFolderDto.slug || slugify(createFolderDto.name);
    
    // Build folder path
    let path = `/${slug}`;
    let depth = 0;
    
    if (createFolderDto.parentId) {
      const parent = await this.findFolderById(createFolderDto.parentId);
      path = `${parent.path}/${slug}`;
      depth = parent.depth + 1;
    }

    const folderData = {
      ...createFolderDto,
      slug,
      path,
      depth,
      createdBy: userId,
      createdByName: userName,
    };

    return this.galleryRepository.createFolder(folderData);
  }

  async updateFolder(id: number, updateFolderDto: UpdateFolderDto) {
    await this.findFolderById(id);
    
    // If name changed, update slug
    if (updateFolderDto.name && !updateFolderDto.slug) {
      updateFolderDto.slug = slugify(updateFolderDto.name);
    }
    
    return this.galleryRepository.updateFolder(id, updateFolderDto);
  }

  async deleteFolder(id: number) {
    const folder = await this.findFolderById(id);
    
    if (folder.isSystem) {
      throw new BadRequestException('System folders cannot be deleted');
    }
    
    await this.galleryRepository.deleteFolder(id);
  }
}