import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { DbModule } from '../db/db.module';
import { UsernameGenerator } from '../utils/username-generator';

@Module({
  imports: [DbModule],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, UsernameGenerator],
  exports: [UsersService, UsernameGenerator],
})
export class UsersModule {}
