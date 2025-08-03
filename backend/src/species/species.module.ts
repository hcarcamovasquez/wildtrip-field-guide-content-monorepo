import { Module } from '@nestjs/common';
import { SpeciesService } from './species.service';
import { SpeciesController } from './species.controller';
import {
  SpeciesPublicController,
  SpeciesPreviewController,
} from './species-public.controller';
import { SpeciesRepository } from './species.repository';
import { LocksModule } from '../locks/locks.module';

@Module({
  imports: [LocksModule],
  controllers: [
    SpeciesController,
    SpeciesPublicController,
    SpeciesPreviewController,
  ],
  providers: [SpeciesService, SpeciesRepository],
  exports: [SpeciesService],
})
export class SpeciesModule {}
