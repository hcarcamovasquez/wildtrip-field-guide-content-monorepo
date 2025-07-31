import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { GalleryRepository } from './gallery.repository';
import { R2Service } from '../storage/r2.service';
import { ImageProcessorService } from '../storage/image-processor.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { UploadFileDto } from './dto/upload-file.dto';
import { slugify } from '@wildtrip/shared';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { Readable } from 'stream';

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);
const mkdir = promisify(fs.mkdir);

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

  async findImagesOnly(query: any) {
    return this.galleryRepository.findImagesOnly(query);
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

  // Chunked upload methods
  async uploadChunk(
    chunk: Express.Multer.File,
    chunkData: any,
    userId: string,
  ) {
    const { uploadId, chunkIndex, totalChunks, filename } = chunkData;
    
    if (!uploadId || chunkIndex === undefined || !totalChunks || !filename) {
      throw new BadRequestException('Missing chunk data: uploadId, chunkIndex, totalChunks, filename required');
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'temp-uploads');
    await mkdir(uploadsDir, { recursive: true });

    // Save chunk to temporary file
    const chunkPath = path.join(uploadsDir, `${uploadId}_${chunkIndex}`);
    await writeFile(chunkPath, chunk.buffer);

    return {
      uploadId,
      chunkIndex: parseInt(chunkIndex),
      totalChunks: parseInt(totalChunks),
      received: true,
    };
  }

  async completeChunkedUpload(
    completeData: any,
    userId: string,
    userName: string,
  ) {
    const { uploadId, totalChunks, filename, folderId, title, description, altText, tags } = completeData;
    
    if (!uploadId || !totalChunks || !filename) {
      throw new BadRequestException('Missing completion data: uploadId, totalChunks, filename required');
    }

    const uploadsDir = path.join(process.cwd(), 'temp-uploads');
    const chunks: Buffer[] = [];

    try {
      // Read all chunks and combine them
      for (let i = 0; i < totalChunks; i++) {
        const chunkPath = path.join(uploadsDir, `${uploadId}_${i}`);
        const chunkBuffer = await readFile(chunkPath);
        chunks.push(chunkBuffer);
      }

      // Combine all chunks into one buffer
      const fileBuffer = Buffer.concat(chunks);

      // Create a mock Multer file object
      const combinedFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: filename,
        encoding: '7bit',
        mimetype: 'image/jpeg', // Will be detected properly during processing
        size: fileBuffer.length,
        buffer: fileBuffer,
        destination: '',
        filename: filename,
        path: '',
        stream: new Readable({ read() {} }),
      };

      // Process the combined file using existing upload logic
      const uploadDto: UploadFileDto = {
        folderId: folderId ? parseInt(folderId) : undefined,
        title,
        description,
        altText,
        tags: tags ? JSON.parse(tags) : [],
      };

      const result = await this.uploadFile(combinedFile, uploadDto, userId, userName);

      // Clean up temporary chunks
      for (let i = 0; i < totalChunks; i++) {
        const chunkPath = path.join(uploadsDir, `${uploadId}_${i}`);
        try {
          await unlink(chunkPath);
        } catch (error) {
          console.warn(`Failed to delete chunk ${chunkPath}:`, error);
        }
      }

      return result;
    } catch (error) {
      // Clean up temporary chunks on error
      for (let i = 0; i < totalChunks; i++) {
        const chunkPath = path.join(uploadsDir, `${uploadId}_${i}`);
        try {
          await unlink(chunkPath);
        } catch (cleanupError) {
          console.warn(`Failed to delete chunk ${chunkPath}:`, cleanupError);
        }
      }
      throw error;
    }
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