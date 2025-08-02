import { Module } from '@nestjs/common';
import { ProtectedAreasService } from './protected-areas.service';
import { ProtectedAreasController } from './protected-areas.controller';
import { ProtectedAreasPublicController, ProtectedAreasPreviewController } from './protected-areas-public.controller';
import { ProtectedAreasRepository } from './protected-areas.repository';
import { LocksModule } from '../locks/locks.module';

@Module({
  imports: [LocksModule],
  controllers: [ProtectedAreasController, ProtectedAreasPublicController, ProtectedAreasPreviewController],
  providers: [ProtectedAreasService, ProtectedAreasRepository],
  exports: [ProtectedAreasService],
})
export class ProtectedAreasModule {}
