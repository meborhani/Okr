import { Module } from '@nestjs/common';
import { SessionMinutesService } from './session-minutes.service';
import { SessionMinutesController } from './session-minutes.controller';

@Module({
  controllers: [SessionMinutesController],
  providers: [SessionMinutesService],
  exports: [SessionMinutesService],
})
export class SessionMinutesModule {}
