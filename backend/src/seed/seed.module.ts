import { Module } from '@nestjs/common';
import { DbModule } from '../db/db.module';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { SpeciesModule } from '../species/species.module';
import { NewsModule } from '../news/news.module';
import { ProtectedAreasModule } from '../protected-areas/protected-areas.module';
import { GalleryModule } from '../gallery/gallery.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    DbModule,
    SpeciesModule,
    NewsModule,
    ProtectedAreasModule,
    GalleryModule,
    UsersModule,
  ],
  controllers: [SeedController],
  providers: [SeedService],
})
export class SeedModule {}
