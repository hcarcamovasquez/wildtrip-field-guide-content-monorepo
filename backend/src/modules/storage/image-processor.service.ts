import { Injectable } from '@nestjs/common';
import sharp from 'sharp';

export interface ProcessedImage {
  buffer: Buffer;
  width: number;
  height: number;
  format: string;
  size: number;
}

@Injectable()
export class ImageProcessorService {
  async processImage(
    buffer: Buffer,
    options?: {
      maxWidth?: number;
      maxHeight?: number;
      quality?: number;
      format?: keyof sharp.FormatEnum;
    },
  ): Promise<ProcessedImage> {
    const {
      maxWidth = 2048,
      maxHeight = 2048,
      quality = 85,
      format = 'webp',
    } = options || {};

    let pipeline = sharp(buffer);

    // Get original metadata
    const metadata = await pipeline.metadata();

    // Resize if needed
    if (metadata.width && metadata.height) {
      if (metadata.width > maxWidth || metadata.height > maxHeight) {
        pipeline = pipeline.resize(maxWidth, maxHeight, {
          fit: 'inside',
          withoutEnlargement: true,
        });
      }
    }

    // Convert format and compress
    pipeline = pipeline[format]({ quality });

    // Process the image
    const processedBuffer = await pipeline.toBuffer({
      resolveWithObject: true,
    });

    return {
      buffer: processedBuffer.data,
      width: processedBuffer.info.width,
      height: processedBuffer.info.height,
      format: processedBuffer.info.format,
      size: processedBuffer.info.size,
    };
  }

  async generateThumbnail(buffer: Buffer, size: number = 200): Promise<Buffer> {
    return sharp(buffer)
      .resize(size, size, {
        fit: 'cover',
        position: 'center',
      })
      .webp({ quality: 80 })
      .toBuffer();
  }

  async getImageMetadata(buffer: Buffer): Promise<sharp.Metadata> {
    return sharp(buffer).metadata();
  }
}
