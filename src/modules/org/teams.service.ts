import { Injectable, NotFoundException } from '@nestjs/common';
import * as sql from 'mssql';
import { DatabaseService } from '../../database/database.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamsService {
  constructor(private db: DatabaseService) {}

  async findAll() {
    const result = await this.db.query<any>(
      `SELECT t.id, t.name, t.description, t.is_active, t.created_at,
              t.department_id, d.name as department_name,
              t.manager_id, u.first_name + ' ' + u.last_name as manager_name
       FROM teams t
       LEFT JOIN departments d ON t.department_id = d.id AND d.deleted_at IS NULL
       LEFT JOIN users u ON t.manager_id = u.id AND u.deleted_at IS NULL
       WHERE t.deleted_at IS NULL
       ORDER BY t.name`,
    );
    return result.recordset.map(this.mapTeam);
  }

  async findById(id: string) {
    const result = await this.db.query<any>(
      `SELECT t.id, t.name, t.description, t.is_active, t.created_at, t.updated_at,
              t.department_id, d.name as department_name,
              t.manager_id, u.first_name + ' ' + u.last_name as manager_name
       FROM teams t
       LEFT JOIN departments d ON t.department_id = d.id AND d.deleted_at IS NULL
       LEFT JOIN users u ON t.manager_id = u.id AND u.deleted_at IS NULL
       WHERE t.id = @id AND t.deleted_at IS NULL`,
      { id: { type: sql.UniqueIdentifier, value: id } },
    );
    if (!result.recordset.length) throw new NotFoundException('تیم یافت نشد');
    return this.mapTeam(result.recordset[0]);
  }

  async create(dto: CreateTeamDto) {
    const result = await this.db.query<any>(
      `INSERT INTO teams (name, description, department_id, manager_id)
       OUTPUT INSERTED.id
       VALUES (@name, @description, @departmentId, @managerId)`,
      {
        name: { type: sql.NVarChar, value: dto.name },
        description: { type: sql.NVarChar, value: dto.description || null },
        departmentId: { type: sql.UniqueIdentifier, value: dto.departmentId || null },
        managerId: { type: sql.UniqueIdentifier, value: dto.managerId || null },
      },
    );
    return this.findById(result.recordset[0].id);
  }

  async update(id: string, dto: UpdateTeamDto) {
    await this.findById(id);
    const sets: string[] = ['updated_at = GETUTCDATE()'];
    const params: Record<string, any> = { id: { type: sql.UniqueIdentifier, value: id } };

    if (dto.name !== undefined) { sets.push('name = @name'); params.name = { type: sql.NVarChar, value: dto.name }; }
    if (dto.description !== undefined) { sets.push('description = @description'); params.description = { type: sql.NVarChar, value: dto.description }; }
    if (dto.departmentId !== undefined) { sets.push('department_id = @departmentId'); params.departmentId = { type: sql.UniqueIdentifier, value: dto.departmentId || null }; }
    if (dto.managerId !== undefined) { sets.push('manager_id = @managerId'); params.managerId = { type: sql.UniqueIdentifier, value: dto.managerId || null }; }
    if (dto.isActive !== undefined) { sets.push('is_active = @isActive'); params.isActive = { type: sql.Bit, value: dto.isActive ? 1 : 0 }; }

    await this.db.query(`UPDATE teams SET ${sets.join(', ')} WHERE id = @id`, params);
    return this.findById(id);
  }

  async remove(id: string) {
    await this.findById(id);
    await this.db.query(
      `UPDATE teams SET deleted_at = GETUTCDATE(), updated_at = GETUTCDATE() WHERE id = @id`,
      { id: { type: sql.UniqueIdentifier, value: id } },
    );
    return { id };
  }

  private mapTeam(t: any) {
    return {
      id: t.id,
      name: t.name,
      description: t.description,
      isActive: t.is_active,
      departmentId: t.department_id,
      departmentName: t.department_name,
      managerId: t.manager_id,
      managerName: t.manager_name,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
    };
  }
}
