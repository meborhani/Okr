import { Module } from '@nestjs/common';
import { ObjectivesService } from './objectives.service';
import { ObjectivesController } from './objectives.controller';

@Module({
  providers: [ObjectivesService],
  controllers: [ObjectivesController],
  exports: [ObjectivesService],
})
export class ObjectivesModule {}
