import { Module, Global } from '@nestjs/common';
import { R2Service } from './r2.service';
import { ImageProcessorService } from './image-processor.service';

@Global()
@Module({
  providers: [R2Service, ImageProcessorService],
  exports: [R2Service, ImageProcessorService],
})
export class StorageModule {}
