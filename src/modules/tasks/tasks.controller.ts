import {
  Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { TasksService, CreateTaskDto, UpdateTaskDto } from './tasks.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { successResponse } from '../../common/response';

@Controller('tasks')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TasksController {
  constructor(private service: TasksService) {}

  @Get()
  @RequirePermissions('check_ins:read')
  async findAll(
    @CurrentUser('id') userId: string,
    @CurrentUser('permissions') permissions: string[],
  ) {
    const isAdmin = Array.isArray(permissions) && permissions.includes('okr_periods:manage');
    return successResponse(await this.service.findAll(userId, isAdmin));
  }

  @Get(':id')
  @RequirePermissions('check_ins:read')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return successResponse(await this.service.findById(id));
  }

  @Post()
  @RequirePermissions('okr_periods:manage')
  async create(
    @Body() dto: CreateTaskDto,
    @CurrentUser('id') userId: string,
  ) {
    return successResponse(await this.service.create(dto, userId), 'تسک ایجاد شد');
  }

  @Patch(':id')
  @RequirePermissions('check_ins:read')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTaskDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('permissions') permissions: string[],
  ) {
    const isAdmin = Array.isArray(permissions) && permissions.includes('okr_periods:manage');
    return successResponse(await this.service.update(id, dto, userId, isAdmin), 'تسک بروزرسانی شد');
  }

  @Patch(':id/status')
  @RequirePermissions('check_ins:read')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('permissions') permissions: string[],
  ) {
    const isAdmin = Array.isArray(permissions) && permissions.includes('okr_periods:manage');
    return successResponse(await this.service.update(id, { status: status as any }, userId, isAdmin), 'وضعیت تسک تغییر کرد');
  }

  @Patch(':id/archive')
  @RequirePermissions('okr_periods:manage')
  async archive(@Param('id', ParseUUIDPipe) id: string) {
    return successResponse(await this.service.update(id, { status: 'archived' }, '', true), 'تسک آرشیو شد');
  }

  @Delete(':id')
  @RequirePermissions('okr_periods:manage')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(id);
    return successResponse(null, 'تسک حذف شد');
  }

  @Get(':id/comments')
  @RequirePermissions('check_ins:read')
  async getComments(@Param('id', ParseUUIDPipe) id: string) {
    return successResponse(await this.service.getComments(id));
  }

  @Post(':id/comments')
  @RequirePermissions('check_ins:read')
  async addComment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('content') content: string,
    @CurrentUser('id') userId: string,
  ) {
    return successResponse(await this.service.addComment(id, content, userId), 'کامنت ثبت شد');
  }

  @Delete(':id/comments/:commentId')
  @RequirePermissions('check_ins:read')
  async deleteComment(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('permissions') permissions: string[],
  ) {
    const isAdmin = Array.isArray(permissions) && permissions.includes('okr_periods:manage');
    await this.service.deleteComment(id, commentId, userId, isAdmin);
    return successResponse(null, 'کامنت حذف شد');
  }

  @Post(':id/tags')
  @RequirePermissions('okr_periods:manage')
  async addTag(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('label') label: string,
    @Body('color') color: string,
  ) {
    return successResponse(await this.service.addTag(id, label, color), 'برچسب اضافه شد');
  }

  @Delete(':id/tags/:tagId')
  @RequirePermissions('okr_periods:manage')
  async removeTag(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('tagId', ParseUUIDPipe) tagId: string,
  ) {
    await this.service.removeTag(id, tagId);
    return successResponse(null, 'برچسب حذف شد');
  }
}
