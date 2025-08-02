import {
  Controller,
  Post,
  Delete,
  ForbiddenException,
} from '@nestjs/common';
import { SeedService } from './seed.service';

@Controller('api/dev/seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post()
  async seed() {
    // Only allow in development environment
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException('Seeding is not allowed in production');
    }

    return this.seedService.seed();
  }

  @Delete()
  async clear() {
    // Only allow in development environment
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException(
        'Clearing database is not allowed in production',
      );
    }

    return this.seedService.clearDatabase();
  }
}