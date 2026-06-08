import { Controller, Get, Put, Body, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { SessionMinutesService } from './session-minutes.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { successResponse } from '../../common/response';

@Controller('session-minutes')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SessionMinutesController {
  constructor(private service: SessionMinutesService) {}

  @Get()
  @RequirePermissions('check_ins:read')
  async getAll() {
    return successResponse(await this.service.findAll());
  }

  @Get(':sessionId')
  @RequirePermissions('check_ins:read')
  async get(@Param('sessionId', ParseUUIDPipe) sessionId: string) {
    return successResponse(await this.service.findBySession(sessionId));
  }

  @Put(':sessionId')
  @RequirePermissions('check_ins:read')
  async upsert(
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @Body('content') content: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('permissions') permissions: string[],
  ) {
    const isAdmin = Array.isArray(permissions) && permissions.includes('okr_periods:manage');
    return successResponse(
      await this.service.upsert(sessionId, content || '', userId, isAdmin),
      'صورت جلسه ذخیره شد',
    );
  }
}
