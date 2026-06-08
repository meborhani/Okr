import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { successResponse } from '../../common/response';

@Controller('reports')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ReportsController {
  constructor(private service: ReportsService) {}

  @Get('dashboard')
  @RequirePermissions('reports:read')
  async getDashboard(@Query('periodId') periodId?: string) {
    return successResponse(await this.service.getDashboard(periodId));
  }

  @Get('team-progress')
  @RequirePermissions('reports:read')
  async getTeamProgress(@Query('periodId') periodId?: string) {
    return successResponse(await this.service.getTeamProgress(periodId));
  }

  @Get('user-progress')
  @RequirePermissions('reports:read')
  async getUserProgress(@Query('periodId') periodId?: string) {
    return successResponse(await this.service.getUserProgress(periodId));
  }

  @Get('check-in-completion')
  @RequirePermissions('reports:read')
  async getCheckInCompletion(@Query('sessionId') sessionId?: string) {
    return successResponse(await this.service.getCheckInCompletion(sessionId));
  }

  @Get('key-result-timeline')
  @RequirePermissions('reports:read')
  async getKeyResultTimeline(@Query('keyResultId') keyResultId: string) {
    return successResponse(await this.service.getKeyResultTimeline(keyResultId));
  }
}
