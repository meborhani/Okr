import { Module } from '@nestjs/common';
import { OkrPeriodsService } from './okr-periods.service';
import { OkrPeriodsController } from './okr-periods.controller';
import { CheckInSessionsModule } from '../check-in-sessions/check-in-sessions.module';

@Module({
  imports: [CheckInSessionsModule],
  providers: [OkrPeriodsService],
  controllers: [OkrPeriodsController],
  exports: [OkrPeriodsService],
})
export class OkrPeriodsModule {}
