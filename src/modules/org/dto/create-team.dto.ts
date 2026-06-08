import { IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateTeamDto {
  @IsString({ message: 'نام تیم الزامی است' })
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID('4', { message: 'شناسه دپارتمان معتبر نیست' })
  departmentId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'شناسه مدیر معتبر نیست' })
  managerId?: string;
}
