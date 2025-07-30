import { Module } from '@nestjs/common';
import { SpeciesService } from './species.service';
import { SpeciesController } from './species.controller';
import { SpeciesRepository } from './species.repository';

@Module({
  controllers: [SpeciesController],
  providers: [SpeciesService, SpeciesRepository],
  exports: [SpeciesService],
})
export class SpeciesModule {}