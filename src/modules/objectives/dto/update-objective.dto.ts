import { IsString, IsUUID, IsOptional, IsNumber, IsIn, IsEnum } from 'class-validator';
import { ObjectiveStatus } from '../../../common/enums';

export class UpdateObjectiveDto {
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
  @IsUUID('4')
  departmentId?: string;

  @IsOptional()
  @IsUUID('4')
  teamId?: string;

  @IsOptional()
  @IsIn(Object.values(ObjectiveStatus), { message: 'وضعیت نامعتبر است' })
  status?: ObjectiveStatus;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsIn(['organization', 'team'])
  scope?: string;
}
