import {
  Controller, Get, Post, Patch, Delete, Body, Param,
  UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { successResponse } from '../../common/response';

@Controller('teams')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TeamsController {
  constructor(private teamsService: TeamsService) {}

  @Get()
  @RequirePermissions('teams:read')
  async findAll() {
    const data = await this.teamsService.findAll();
    return successResponse(data);
  }

  @Post()
  @RequirePermissions('teams:create')
  async create(@Body() dto: CreateTeamDto) {
    const data = await this.teamsService.create(dto);
    return successResponse(data, 'تیم با موفقیت ایجاد شد');
  }

  @Patch(':id')
  @RequirePermissions('teams:update')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTeamDto) {
    const data = await this.teamsService.update(id, dto);
    return successResponse(data, 'تیم با موفقیت ویرایش شد');
  }

  @Delete(':id')
  @RequirePermissions('teams:delete')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.teamsService.remove(id);
    return successResponse(data, 'تیم با موفقیت حذف شد');
  }
}
