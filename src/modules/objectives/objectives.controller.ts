import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ObjectivesService } from './objectives.service';
import { CreateObjectiveDto } from './dto/create-objective.dto';
import { UpdateObjectiveDto } from './dto/update-objective.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { successResponse } from '../../common/response';

@Controller('objectives')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ObjectivesController {
  constructor(private service: ObjectivesService) {}

  @Get()
  @RequirePermissions('objectives:read')
  async findAll(@Query('periodId') periodId?: string, @Query('ownerId') ownerId?: string) {
    return successResponse(await this.service.findAll(periodId, ownerId));
  }

  @Get(':id')
  @RequirePermissions('objectives:read')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return successResponse(await this.service.findById(id));
  }

  @Post()
  @RequirePermissions('objectives:create')
  async create(@Body() dto: CreateObjectiveDto) {
    return successResponse(await this.service.create(dto), 'هدف با موفقیت ایجاد شد');
  }

  @Patch(':id')
  @RequirePermissions('objectives:update')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateObjectiveDto) {
    return successResponse(await this.service.update(id, dto), 'هدف با موفقیت ویرایش شد');
  }

  @Delete(':id')
  @RequirePermissions('objectives:delete')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return successResponse(await this.service.remove(id), 'هدف با موفقیت حذف شد');
  }
}
