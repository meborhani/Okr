import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as sql from 'mssql';
import { DatabaseService } from '../../database/database.service';
import { RbacService } from '../rbac/rbac.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private db: DatabaseService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private rbacService: RbacService,
  ) {}

  async login(dto: LoginDto) {
    const result = await this.db.query<any>(
      `SELECT u.id, u.email, u.password_hash, u.first_name, u.last_name, u.is_active,
              r.name as role_name, r.id as role_id
       FROM users u
       INNER JOIN roles r ON u.role_id = r.id
       WHERE u.email = @email AND u.deleted_at IS NULL`,
      { email: { type: sql.NVarChar, value: dto.email } },
    );

    if (!result.recordset.length) {
      throw new UnauthorizedException('ایمیل یا رمز عبور اشتباه است');
    }

    const user = result.recordset[0];

    if (!user.is_active) {
      throw new UnauthorizedException('حساب کاربری غیرفعال است');
    }

    const isValid = await bcrypt.compare(dto.password, user.password_hash);
    if (!isValid) {
      throw new UnauthorizedException('ایمیل یا رمز عبور اشتباه است');
    }

    await this.db.query(
      `UPDATE users SET last_login_at = GETUTCDATE() WHERE id = @id`,
      { id: { type: sql.UniqueIdentifier, value: user.id } },
    );

    const permissions = await this.rbacService.getUserPermissions(user.id);

    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '1d'),
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        roleName: user.role_name,
        permissions,
      },
    };
  }

  async getMe(userId: string) {
    const result = await this.db.query<any>(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.is_active,
              u.last_login_at, u.created_at,
              r.name as role_name, r.display_name as role_display_name,
              d.name as department_name, t.name as team_name
       FROM users u
       INNER JOIN roles r ON u.role_id = r.id
       LEFT JOIN departments d ON u.department_id = d.id AND d.deleted_at IS NULL
       LEFT JOIN teams t ON u.team_id = t.id AND t.deleted_at IS NULL
       WHERE u.id = @id AND u.deleted_at IS NULL`,
      { id: { type: sql.UniqueIdentifier, value: userId } },
    );

    if (!result.recordset.length) {
      throw new UnauthorizedException('کاربر یافت نشد');
    }

    const user = result.recordset[0];
    const permissions = await this.rbacService.getUserPermissions(userId);

    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      roleName: user.role_name,
      roleDisplayName: user.role_display_name,
      departmentName: user.department_name,
      teamName: user.team_name,
      lastLoginAt: user.last_login_at,
      createdAt: user.created_at,
      permissions,
    };
  }
}
