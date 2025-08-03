import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ClerkWebhookController } from './clerk-webhook.controller';
import { UsersRepository } from './users.repository';
import { DbModule } from '../../db/db.module';
import { UsernameGenerator } from '../../utils/username-generator';

@Module({
  imports: [DbModule, ConfigModule],
  controllers: [UsersController, ClerkWebhookController],
  providers: [UsersService, UsersRepository, UsernameGenerator],
  exports: [UsersService, UsernameGenerator],
})
export class UsersModule {}
