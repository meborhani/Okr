import { IsString, IsUUID, IsOptional, IsNumber } from 'class-validator';

export class CreateKeyResultDto {
  @IsString({ message: 'عنوان نتیجه کلیدی الزامی است' })
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsUUID('4', { message: 'شناسه هدف معتبر نیست' })
  objectiveId: string;

  @IsUUID('4', { message: 'شناسه مالک معتبر نیست' })
  ownerId: string;

  @IsNumber({}, { message: 'مقدار شروع باید عدد باشد' })
  startValue: number;

  @IsNumber({}, { message: 'مقدار هدف باید عدد باشد' })
  targetValue: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsNumber()
  weight?: number;
}
