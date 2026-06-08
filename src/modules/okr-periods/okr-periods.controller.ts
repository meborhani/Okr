import {
  Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { OkrPeriodsService } from './okr-periods.service';
import { CreateOkrPeriodDto } from './dto/create-okr-period.dto';
import { UpdateOkrPeriodDto } from './dto/update-okr-period.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { successResponse } from '../../common/response';

@Controller('okr-periods')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class OkrPeriodsController {
  constructor(private service: OkrPeriodsService) {}

  @Get()
  @RequirePermissions('okr_periods:read')
  async findAll() {
    return successResponse(await this.service.findAll());
  }

  @Get('active')
  @RequirePermissions('okr_periods:read')
  async findActive() {
    return successResponse(await this.service.findActive());
  }

  @Get(':id')
  @RequirePermissions('okr_periods:read')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return successResponse(await this.service.findById(id));
  }

  @Post()
  @RequirePermissions('okr_periods:create')
  async create(@Body() dto: CreateOkrPeriodDto, @CurrentUser('id') userId: string) {
    return successResponse(await this.service.create(dto, userId), 'دوره OKR با موفقیت ایجاد شد');
  }

  @Patch(':id')
  @RequirePermissions('okr_periods:update')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateOkrPeriodDto) {
    return successResponse(await this.service.update(id, dto), 'دوره OKR با موفقیت ویرایش شد');
  }

  @Post(':id/activate')
  @RequirePermissions('okr_periods:manage')
  async activate(@Param('id', ParseUUIDPipe) id: string) {
    return successResponse(await this.service.activate(id), 'دوره OKR فعال شد');
  }

  @Post(':id/close')
  @RequirePermissions('okr_periods:manage')
  async close(@Param('id', ParseUUIDPipe) id: string) {
    return successResponse(await this.service.close(id), 'دوره OKR بسته شد');
  }

  @Post(':id/archive')
  @RequirePermissions('okr_periods:manage')
  async archive(@Param('id', ParseUUIDPipe) id: string) {
    return successResponse(await this.service.archive(id), 'دوره OKR آرشیو شد');
  }

  @Post(':id/reopen')
  @RequirePermissions('okr_periods:manage')
  async reopen(@Param('id', ParseUUIDPipe) id: string) {
    return successResponse(await this.service.reopen(id), 'دوره OKR بازگشایی شد');
  }

  @Delete(':id')
  @RequirePermissions('okr_periods:manage')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(id);
    return successResponse(null, 'دوره OKR حذف شد');
  }
}
