import { Module } from '@nestjs/common';
import { CheckInsService } from './check-ins.service';
import { CheckInsController } from './check-ins.controller';
import { KeyResultsModule } from '../key-results/key-results.module';

@Module({
  imports: [KeyResultsModule],
  providers: [CheckInsService],
  controllers: [CheckInsController],
  exports: [CheckInsService],
})
export class CheckInsModule {}
