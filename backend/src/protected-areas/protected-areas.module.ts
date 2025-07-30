import { Module } from '@nestjs/common';
import { ProtectedAreasService } from './protected-areas.service';
import { ProtectedAreasController } from './protected-areas.controller';
import { ProtectedAreasRepository } from './protected-areas.repository';

@Module({
  controllers: [ProtectedAreasController],
  providers: [ProtectedAreasService, ProtectedAreasRepository],
  exports: [ProtectedAreasService],
})
export class ProtectedAreasModule {}