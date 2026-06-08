import { IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateDepartmentDto {
  @IsString({ message: 'نام دپارتمان الزامی است' })
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID('4', { message: 'شناسه مدیر معتبر نیست' })
  managerId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'شناسه دپارتمان والد معتبر نیست' })
  parentId?: string;
}
