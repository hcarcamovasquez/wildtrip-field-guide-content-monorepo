import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { DbModule } from './db/db.module';
import { AuthModule } from './modules/auth/auth.module';
import { StorageModule } from './modules/storage/storage.module';
import { LocksModule } from './modules/locks/locks.module';
import { SpeciesModule } from './modules/species/species.module';
import { NewsModule } from './modules/news/news.module';
import { ProtectedAreasModule } from './modules/protected-areas/protected-areas.module';
import { GalleryModule } from './modules/gallery/gallery.module';
import { UsersModule } from './modules/users/users.module';
import { AIModule } from './modules/ai/ai.module';
import { SeedModule } from './modules/seed/seed.module';
import { HealthModule } from './modules/health/health.module';
import { SitemapModule } from './modules/sitemap/sitemap.module';

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
    SitemapModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
