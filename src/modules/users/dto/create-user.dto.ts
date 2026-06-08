import { IsEmail, IsString, IsUUID, IsOptional, MinLength, Matches } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'ایمیل معتبر نیست' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'رمز عبور باید حداقل ۸ کاراکتر باشد' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'رمز عبور باید شامل حرف بزرگ، حرف کوچک و عدد باشد',
  })
  password: string;

  @IsString({ message: 'نام الزامی است' })
  firstName: string;

  @IsString({ message: 'نام خانوادگی الزامی است' })
  lastName: string;

  @IsUUID('4', { message: 'شناسه نقش معتبر نیست' })
  roleId: string;

  @IsOptional()
  @IsUUID('4', { message: 'شناسه دپارتمان معتبر نیست' })
  departmentId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'شناسه تیم معتبر نیست' })
  teamId?: string;
}
