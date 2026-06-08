import { Controller, Get, UseGuards } from '@nestjs/common';
import { RbacService } from './rbac.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { successResponse } from '../../common/response';

@Controller('roles')
@UseGuards(JwtAuthGuard)
export class RbacController {
  constructor(private rbacService: RbacService) {}

  @Get()
  async getRoles() {
    return successResponse(await this.rbacService.getRoles());
  }
}
