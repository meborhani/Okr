import { Module } from '@nestjs/common';
import { KeyResultsService } from './key-results.service';
import { KeyResultsController } from './key-results.controller';
import { ObjectivesModule } from '../objectives/objectives.module';

@Module({
  imports: [ObjectivesModule],
  providers: [KeyResultsService],
  controllers: [KeyResultsController],
  exports: [KeyResultsService],
})
export class KeyResultsModule {}
