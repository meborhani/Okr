import { IsString, IsInt, IsDateString, IsOptional, Min, Max } from 'class-validator';

export class CreateOkrPeriodDto {
  @IsString({ message: 'عنوان دوره الزامی است' })
  title: string;

  @IsInt({ message: 'سال باید عدد صحیح باشد' })
  @Min(1400)
  @Max(1500)
  year: number;

  @IsInt({ message: 'فصل باید عدد صحیح باشد' })
  @Min(1)
  @Max(4)
  quarter: number;

  @IsDateString({}, { message: 'تاریخ شروع معتبر نیست' })
  startDate: string;

  @IsDateString({}, { message: 'تاریخ پایان معتبر نیست' })
  endDate: string;

  @IsOptional()
  @IsString()
  description?: string;
}
