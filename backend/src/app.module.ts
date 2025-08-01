import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { DbModule } from './db/db.module';
import { AuthModule } from './auth/auth.module';
import { StorageModule } from './storage/storage.module';
import { LocksModule } from './locks/locks.module';
import { SpeciesModule } from './species/species.module';
import { NewsModule } from './news/news.module';
import { ProtectedAreasModule } from './protected-areas/protected-areas.module';
import { GalleryModule } from './gallery/gallery.module';
import { UsersModule } from './users/users.module';
import { AIModule } from './ai/ai.module';
import { SeedModule } from './seed/seed.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    DbModule,
    AuthModule,
    StorageModule,
    LocksModule,
    SpeciesModule,
    NewsModule,
    ProtectedAreasModule,
    GalleryModule,
    UsersModule,
    AIModule,
    SeedModule,
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
