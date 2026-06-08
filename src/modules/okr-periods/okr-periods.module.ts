import { Module } from '@nestjs/common';
import { OkrPeriodsService } from './okr-periods.service';
import { OkrPeriodsController } from './okr-periods.controller';

@Module({
  providers: [OkrPeriodsService],
  controllers: [OkrPeriodsController],
  exports: [OkrPeriodsService],
})
export class OkrPeriodsModule {}
