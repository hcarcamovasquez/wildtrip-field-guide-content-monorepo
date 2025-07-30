import { Module, Global } from '@nestjs/common';
import { LocksService } from './locks.service';

@Global()
@Module({
  providers: [LocksService],
  exports: [LocksService],
})
export class LocksModule {}