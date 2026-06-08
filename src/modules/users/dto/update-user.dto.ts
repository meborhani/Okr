import { IsString, IsUUID, IsOptional, IsBoolean } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsUUID('4', { message: 'شناسه نقش معتبر نیست' })
  roleId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'شناسه دپارتمان معتبر نیست' })
  departmentId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'شناسه تیم معتبر نیست' })
  teamId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
