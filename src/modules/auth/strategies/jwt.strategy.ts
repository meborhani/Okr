import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../../../database/database.service';
import { RbacService } from '../../rbac/rbac.service';
import * as sql from 'mssql';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private db: DatabaseService,
    private rbacService: RbacService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET', 'default_secret'),
    });
  }

  async validate(payload: { sub: string; email: string }) {
    const result = await this.db.query<any>(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.is_active,
              r.name as role_name, r.id as role_id
       FROM users u
       INNER JOIN roles r ON u.role_id = r.id
       WHERE u.id = @id AND u.deleted_at IS NULL`,
      { id: { type: sql.UniqueIdentifier, value: payload.sub } },
    );

    if (!result.recordset.length) {
      throw new UnauthorizedException('کاربر یافت نشد');
    }

    const user = result.recordset[0];
    if (!user.is_active) {
      throw new UnauthorizedException('حساب کاربری غیرفعال است');
    }

    const permissions = await this.rbacService.getUserPermissions(user.id);

    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      roleId: user.role_id,
      roleName: user.role_name,
      permissions,
    };
  }
}
