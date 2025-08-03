import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class R2Service {
  private s3Client: S3Client;
  private bucketName: string;
  private publicUrl: string;

  constructor(private configService: ConfigService) {
    const accountId = this.configService.get<string>('s3.accountId');
    const accessKeyId = this.configService.get<string>('s3.accessKeyId');
    const secretAccessKey =
      this.configService.get<string>('s3.secretAccessKey');

    this.bucketName =
      this.configService.get<string>('s3.bucketName') || 'wildtrip-gallery';
    this.publicUrl = this.configService.get<string>('s3.publicUrl') || '';

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: accessKeyId!,
        secretAccessKey: secretAccessKey!,
      },
    });
  }

  async uploadFile(
    buffer: Buffer,
    originalFilename: string,
    mimeType: string,
    folder?: string,
  ): Promise<{
    key: string;
    url: string;
  }> {
    // Generate unique filename
    const ext = originalFilename.split('.').pop();
    const filename = `${uuidv4()}.${ext}`;
    const key = folder ? `${folder}/${filename}` : filename;

    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    });

    await this.s3Client.send(command);

    // Return public URL
    const url = `${this.publicUrl}/${key}`;

    return { key, url };
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await this.s3Client.send(command);
  }

  async getSignedUploadUrl(
    filename: string,
    mimeType: string,
    folder?: string,
  ): Promise<{
    uploadUrl: string;
    key: string;
  }> {
    const ext = filename.split('.').pop();
    const uniqueFilename = `${uuidv4()}.${ext}`;
    const key = folder ? `${folder}/${uniqueFilename}` : uniqueFilename;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: mimeType,
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: 3600,
    });

    return { uploadUrl, key };
  }

  getPublicUrl(key: string): string {
    return `${this.publicUrl}/${key}`;
  }

  getKeyFromUrl(url: string): string {
    return url.replace(`${this.publicUrl}/`, '');
  }
}
