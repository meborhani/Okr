import { IsUUID, IsNumber, IsOptional, IsString, IsDateString } from 'class-validator';

export class CreateCheckInDto {
  @IsUUID('4', { message: 'شناسه نتیجه کلیدی معتبر نیست' })
  keyResultId: string;

  @IsNumber({}, { message: 'مقدار باید عدد باشد' })
  value: number;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsDateString()
  checkDate?: string;

  @IsOptional()
  @IsUUID('4')
  sessionId?: string;
}
