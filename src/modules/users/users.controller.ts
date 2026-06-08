import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { successResponse } from '../../common/response';

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @RequirePermissions('users:read')
  async findAll(@Query('page') page = 1, @Query('limit') limit = 20) {
    const result = await this.usersService.findAll(+page, +limit);
    return successResponse(result);
  }

  @Get(':id')
  @RequirePermissions('users:read')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.usersService.findById(id);
    return successResponse(user);
  }

  @Post()
  @RequirePermissions('users:create')
  async create(@Body() dto: CreateUserDto) {
    const user = await this.usersService.create(dto);
    return successResponse(user, 'کاربر با موفقیت ایجاد شد');
  }

  @Patch(':id')
  @RequirePermissions('users:update')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUserDto) {
    const user = await this.usersService.update(id, dto);
    return successResponse(user, 'کاربر با موفقیت ویرایش شد');
  }

  @Delete(':id')
  @RequirePermissions('users:delete')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const result = await this.usersService.remove(id);
    return successResponse(result, 'کاربر با موفقیت حذف شد');
  }
}
