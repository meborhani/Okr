import { Module } from '@nestjs/common';
import { CheckInSessionsService } from './check-in-sessions.service';
import { CheckInSessionsController } from './check-in-sessions.controller';

@Module({
  providers: [CheckInSessionsService],
  controllers: [CheckInSessionsController],
  exports: [CheckInSessionsService],
})
export class CheckInSessionsModule {}
