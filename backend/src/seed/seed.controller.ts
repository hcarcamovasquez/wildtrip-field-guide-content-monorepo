import { Controller, Post, Delete, UseGuards, ForbiddenException } from '@nestjs/common';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SeedService } from './seed.service';

@Controller('api/dev')
@UseGuards(ClerkAuthGuard, RolesGuard)
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post('seed')
  @Roles('admin')
  async seed(@CurrentUser() user: any) {
    // Only allow in development environment
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException('Seeding is not allowed in production');
    }

    return this.seedService.seed();
  }

  @Delete('clear')
  @Roles('admin')
  async clear(@CurrentUser() user: any) {
    // Only allow in development environment
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException('Clearing database is not allowed in production');
    }

    return this.seedService.clearDatabase();
  }
}