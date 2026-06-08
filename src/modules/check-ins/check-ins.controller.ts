import {
  Controller, Get, Post, Body, Param, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { CheckInsService } from './check-ins.service';
import { CreateCheckInDto } from './dto/create-check-in.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { successResponse } from '../../common/response';

@Controller('check-ins')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CheckInsController {
  constructor(private service: CheckInsService) {}

  @Get()
  @RequirePermissions('check_ins:read')
  async findAll() {
    return successResponse(await this.service.findAll());
  }

  @Post()
  @RequirePermissions('check_ins:create')
  async create(@Body() dto: CreateCheckInDto, @CurrentUser('id') userId: string) {
    return successResponse(await this.service.create(dto, userId), 'چک‌این با موفقیت ثبت شد');
  }
}
