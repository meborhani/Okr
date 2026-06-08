import { IsString, IsUUID, IsOptional, IsBoolean } from 'class-validator';

export class UpdateTeamDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID('4')
  departmentId?: string;

  @IsOptional()
  @IsUUID('4')
  managerId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
