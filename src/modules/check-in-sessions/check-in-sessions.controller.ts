import {
  Controller, Get, Patch, Post, Delete, Body, Param, Query,
  UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { IsUUID, IsEnum } from 'class-validator';
import { CheckInSessionsService } from './check-in-sessions.service';
import { UpdateSessionDto } from './dto/update-session.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { successResponse } from '../../common/response';
import { CheckInFrequency } from '../../common/enums';

class GenerateSessionsDto {
  @IsUUID()
  periodId: string;

  @IsEnum(CheckInFrequency)
  frequency: CheckInFrequency;
}

@Controller('check-in-sessions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CheckInSessionsController {
  constructor(private service: CheckInSessionsService) {}

  @Get()
  @RequirePermissions('check_ins:read')
  async findAll(@Query('periodId') periodId?: string) {
    return successResponse(await this.service.findAll(periodId));
  }

  @Get('current')
  @RequirePermissions('check_ins:read')
  async findCurrent() {
    return successResponse(await this.service.findCurrent());
  }

  @Post('generate')
  @RequirePermissions('okr_periods:manage')
  async generate(@Body() dto: GenerateSessionsDto) {
    await this.service.generateForPeriod(dto.periodId, dto.frequency);
    return successResponse(null, 'جلسات چک‌این با موفقیت ساخته شدند');
  }

  @Get(':id/completion')
  @RequirePermissions('reports:read')
  async getCompletion(@Param('id', ParseUUIDPipe) id: string) {
    return successResponse(await this.service.getCompletionByDepartment(id));
  }

  @Get(':id/key-results')
  @RequirePermissions('check_ins:read')
  async getKrs(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return successResponse(await this.service.findKrsForSession(id, userId));
  }

  @Get(':id')
  @RequirePermissions('check_ins:read')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return successResponse(await this.service.findById(id));
  }

  @Patch(':id')
  @RequirePermissions('okr_periods:update')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSessionDto,
  ) {
    return successResponse(await this.service.update(id, dto), 'جلسه چک‌این به‌روز شد');
  }

  @Delete(':id')
  @RequirePermissions('okr_periods:manage')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(id);
    return successResponse(null, 'جلسه چک‌این حذف شد');
  }
}
