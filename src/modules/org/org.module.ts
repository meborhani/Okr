import { Module } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { DepartmentsController } from './departments.controller';
import { TeamsService } from './teams.service';
import { TeamsController } from './teams.controller';

@Module({
  providers: [DepartmentsService, TeamsService],
  controllers: [DepartmentsController, TeamsController],
  exports: [DepartmentsService, TeamsService],
})
export class OrgModule {}
