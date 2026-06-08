import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuditModule } from './modules/audit/audit.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RbacModule } from './modules/rbac/rbac.module';
import { OrgModule } from './modules/org/org.module';
import { OkrPeriodsModule } from './modules/okr-periods/okr-periods.module';
import { ObjectivesModule } from './modules/objectives/objectives.module';
import { KeyResultsModule } from './modules/key-results/key-results.module';
import { CheckInsModule } from './modules/check-ins/check-ins.module';
import { CheckInSessionsModule } from './modules/check-in-sessions/check-in-sessions.module';
import { ReportsModule } from './modules/reports/reports.module';
import { SessionMinutesModule } from './modules/session-minutes/session-minutes.module';
import { TasksModule } from './modules/tasks/tasks.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuditModule,
    RbacModule,
    AuthModule,
    UsersModule,
    OrgModule,
    OkrPeriodsModule,
    ObjectivesModule,
    KeyResultsModule,
    CheckInsModule,
    CheckInSessionsModule,
    ReportsModule,
    SessionMinutesModule,
    TasksModule,
  ],
})
export class AppModule {}
