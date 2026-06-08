import { IsEnum, IsOptional, IsDateString, IsString } from 'class-validator';
import { CheckInSessionStatus } from '../../../common/enums';

export class UpdateSessionDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsEnum(CheckInSessionStatus)
  status?: CheckInSessionStatus;
}
