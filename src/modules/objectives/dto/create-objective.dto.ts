import { IsString, IsUUID, IsOptional, IsNumber, IsIn } from 'class-validator';

export class CreateObjectiveDto {
  @IsString({ message: 'عنوان هدف الزامی است' })
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsUUID('4', { message: 'شناسه دوره OKR معتبر نیست' })
  periodId: string;

  @IsUUID('4', { message: 'شناسه مالک معتبر نیست' })
  ownerId: string;

  @IsOptional()
  @IsUUID('4')
  departmentId?: string;

  @IsOptional()
  @IsUUID('4')
  teamId?: string;

  @IsOptional()
  @IsUUID('4')
  parentId?: string;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsIn(['organization', 'team'])
  scope?: string;
}
