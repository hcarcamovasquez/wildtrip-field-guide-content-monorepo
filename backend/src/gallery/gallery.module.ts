import { Module } from '@nestjs/common';
import { GalleryService } from './gallery.service';
import { GalleryController } from './gallery.controller';
import { GalleryRepository } from './gallery.repository';

@Module({
  controllers: [GalleryController],
  providers: [GalleryService, GalleryRepository],
  exports: [GalleryService],
})
export class GalleryModule {}