import { IsString, IsUUID, IsOptional, IsNumber, IsIn } from 'class-validator';
import { KeyResultStatus } from '../../../common/enums';

export class UpdateKeyResultDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID('4')
  ownerId?: string;

  @IsOptional()
  @IsNumber()
  targetValue?: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsIn(Object.values(KeyResultStatus), { message: 'وضعیت نامعتبر است' })
  status?: KeyResultStatus;

  @IsOptional()
  @IsNumber()
  weight?: number;
}
