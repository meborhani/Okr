import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards, ParseUUIDPipe, Inject, forwardRef,
} from '@nestjs/common';
import { KeyResultsService } from './key-results.service';
import { CreateKeyResultDto } from './dto/create-key-result.dto';
import { UpdateKeyResultDto } from './dto/update-key-result.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { successResponse } from '../../common/response';

@Controller('key-results')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class KeyResultsController {
  constructor(private service: KeyResultsService) {}

  @Get()
  @RequirePermissions('key_results:read')
  async findAll(@Query('objectiveId') objectiveId?: string, @Query('ownerId') ownerId?: string) {
    return successResponse(await this.service.findAll(objectiveId, ownerId));
  }

  @Get(':id')
  @RequirePermissions('key_results:read')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return successResponse(await this.service.findById(id));
  }

  @Get(':id/check-ins')
  @RequirePermissions('check_ins:read')
  async getCheckIns(@Param('id', ParseUUIDPipe) id: string) {
    const checkIns = await this.service.getCheckIns(id);
    return successResponse(checkIns);
  }

  @Post()
  @RequirePermissions('key_results:create')
  async create(@Body() dto: CreateKeyResultDto) {
    return successResponse(await this.service.create(dto), 'نتیجه کلیدی با موفقیت ایجاد شد');
  }

  @Patch(':id')
  @RequirePermissions('key_results:update')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateKeyResultDto) {
    return successResponse(await this.service.update(id, dto), 'نتیجه کلیدی با موفقیت ویرایش شد');
  }

  @Delete(':id')
  @RequirePermissions('key_results:delete')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return successResponse(await this.service.remove(id), 'نتیجه کلیدی با موفقیت حذف شد');
  }
}
