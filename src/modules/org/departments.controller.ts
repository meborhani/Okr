import {
  Controller, Get, Post, Patch, Delete, Body, Param,
  UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { successResponse } from '../../common/response';

@Controller('departments')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DepartmentsController {
  constructor(private deptService: DepartmentsService) {}

  @Get()
  @RequirePermissions('departments:read')
  async findAll() {
    const data = await this.deptService.findAll();
    return successResponse(data);
  }

  @Post()
  @RequirePermissions('departments:create')
  async create(@Body() dto: CreateDepartmentDto) {
    const data = await this.deptService.create(dto);
    return successResponse(data, 'دپارتمان با موفقیت ایجاد شد');
  }

  @Patch(':id')
  @RequirePermissions('departments:update')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateDepartmentDto) {
    const data = await this.deptService.update(id, dto);
    return successResponse(data, 'دپارتمان با موفقیت ویرایش شد');
  }

  @Delete(':id')
  @RequirePermissions('departments:delete')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.deptService.remove(id);
    return successResponse(data, 'دپارتمان با موفقیت حذف شد');
  }
}
