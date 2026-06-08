import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as sql from 'mssql';
import { DatabaseService } from '../../database/database.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private db: DatabaseService) {}

  async findAll(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const result = await this.db.query<any>(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.is_active,
              u.role_id, u.department_id, u.team_id,
              u.last_login_at, u.created_at,
              r.name as role_name, r.display_name as role_display_name,
              d.name as department_name, t.name as team_name
       FROM users u
       INNER JOIN roles r ON u.role_id = r.id
       LEFT JOIN departments d ON u.department_id = d.id AND d.deleted_at IS NULL
       LEFT JOIN teams t ON u.team_id = t.id AND t.deleted_at IS NULL
       WHERE u.deleted_at IS NULL
       ORDER BY u.created_at DESC
       OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`,
      {
        offset: { type: sql.Int, value: offset },
        limit: { type: sql.Int, value: limit },
      },
    );

    const countResult = await this.db.query<{ total: number }>(
      `SELECT COUNT(*) as total FROM users WHERE deleted_at IS NULL`,
    );

    return {
      data: result.recordset.map(this.mapUser),
      total: countResult.recordset[0].total,
      page,
      limit,
    };
  }

  async findById(id: string) {
    const result = await this.db.query<any>(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.is_active,
              u.role_id, u.department_id, u.team_id,
              u.last_login_at, u.created_at, u.updated_at,
              r.name as role_name, r.display_name as role_display_name,
              d.name as department_name, t.name as team_name
       FROM users u
       INNER JOIN roles r ON u.role_id = r.id
       LEFT JOIN departments d ON u.department_id = d.id AND d.deleted_at IS NULL
       LEFT JOIN teams t ON u.team_id = t.id AND t.deleted_at IS NULL
       WHERE u.id = @id AND u.deleted_at IS NULL`,
      { id: { type: sql.UniqueIdentifier, value: id } },
    );

    if (!result.recordset.length) {
      throw new NotFoundException('کاربر یافت نشد');
    }
    return this.mapUser(result.recordset[0]);
  }

  async create(dto: CreateUserDto) {
    const existing = await this.db.query<any>(
      `SELECT id FROM users WHERE email = @email`,
      { email: { type: sql.NVarChar, value: dto.email } },
    );
    if (existing.recordset.length) {
      throw new ConflictException('این ایمیل قبلاً ثبت شده است');
    }

    await this.validateRole(dto.roleId);

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const result = await this.db.query<any>(
      `INSERT INTO users (email, password_hash, first_name, last_name, role_id, department_id, team_id)
       OUTPUT INSERTED.id
       VALUES (@email, @passwordHash, @firstName, @lastName, @roleId, @departmentId, @teamId)`,
      {
        email: { type: sql.NVarChar, value: dto.email },
        passwordHash: { type: sql.NVarChar, value: passwordHash },
        firstName: { type: sql.NVarChar, value: dto.firstName },
        lastName: { type: sql.NVarChar, value: dto.lastName },
        roleId: { type: sql.UniqueIdentifier, value: dto.roleId },
        departmentId: { type: sql.UniqueIdentifier, value: dto.departmentId || null },
        teamId: { type: sql.UniqueIdentifier, value: dto.teamId || null },
      },
    );

    return this.findById(result.recordset[0].id);
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findById(id);

    const setClauses: string[] = ['updated_at = GETUTCDATE()'];
    const params: Record<string, any> = { id: { type: sql.UniqueIdentifier, value: id } };

    if (dto.firstName !== undefined) {
      setClauses.push('first_name = @firstName');
      params.firstName = { type: sql.NVarChar, value: dto.firstName };
    }
    if (dto.lastName !== undefined) {
      setClauses.push('last_name = @lastName');
      params.lastName = { type: sql.NVarChar, value: dto.lastName };
    }
    if (dto.roleId !== undefined) {
      await this.validateRole(dto.roleId);
      setClauses.push('role_id = @roleId');
      params.roleId = { type: sql.UniqueIdentifier, value: dto.roleId };
    }
    if (dto.departmentId !== undefined) {
      setClauses.push('department_id = @departmentId');
      params.departmentId = { type: sql.UniqueIdentifier, value: dto.departmentId || null };
    }
    if (dto.teamId !== undefined) {
      setClauses.push('team_id = @teamId');
      params.teamId = { type: sql.UniqueIdentifier, value: dto.teamId || null };
    }
    if (dto.isActive !== undefined) {
      setClauses.push('is_active = @isActive');
      params.isActive = { type: sql.Bit, value: dto.isActive ? 1 : 0 };
    }

    await this.db.query(
      `UPDATE users SET ${setClauses.join(', ')} WHERE id = @id`,
      params,
    );

    return this.findById(id);
  }

  async remove(id: string) {
    await this.findById(id);
    await this.db.query(
      `UPDATE users SET deleted_at = GETUTCDATE(), updated_at = GETUTCDATE() WHERE id = @id`,
      { id: { type: sql.UniqueIdentifier, value: id } },
    );
    return { id };
  }

  private async validateRole(roleId: string) {
    const result = await this.db.query<any>(
      `SELECT id FROM roles WHERE id = @id AND deleted_at IS NULL`,
      { id: { type: sql.UniqueIdentifier, value: roleId } },
    );
    if (!result.recordset.length) {
      throw new BadRequestException('نقش انتخاب شده معتبر نیست');
    }
  }

  async changePassword(id: string, newPassword: string): Promise<void> {
    await this.findById(id);
    const hash = await bcrypt.hash(newPassword, 12);
    await this.db.query(
      `UPDATE users SET password_hash = @hash, updated_at = GETUTCDATE() WHERE id = @id`,
      {
        id: { type: sql.UniqueIdentifier, value: id },
        hash: { type: sql.NVarChar, value: hash },
      },
    );
  }

  private mapUser(u: any) {
    return {
      id: u.id,
      email: u.email,
      firstName: u.first_name,
      lastName: u.last_name,
      isActive: u.is_active,
      roleId: u.role_id,
      roleName: u.role_name,
      roleDisplayName: u.role_display_name,
      departmentId: u.department_id,
      departmentName: u.department_name,
      teamId: u.team_id,
      teamName: u.team_name,
      lastLoginAt: u.last_login_at,
      createdAt: u.created_at,
      updatedAt: u.updated_at,
    };
  }
}
