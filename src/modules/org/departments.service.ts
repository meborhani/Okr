import { Injectable, NotFoundException } from '@nestjs/common';
import * as sql from 'mssql';
import { DatabaseService } from '../../database/database.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(private db: DatabaseService) {}

  async findAll() {
    const result = await this.db.query<any>(
      `SELECT d.id, d.name, d.description, d.is_active, d.created_at,
              d.parent_id, pd.name as parent_name,
              d.manager_id, u.first_name + ' ' + u.last_name as manager_name
       FROM departments d
       LEFT JOIN departments pd ON d.parent_id = pd.id AND pd.deleted_at IS NULL
       LEFT JOIN users u ON d.manager_id = u.id AND u.deleted_at IS NULL
       WHERE d.deleted_at IS NULL
       ORDER BY d.name`,
    );
    return result.recordset.map(this.mapDept);
  }

  async findById(id: string) {
    const result = await this.db.query<any>(
      `SELECT d.id, d.name, d.description, d.is_active, d.created_at, d.updated_at,
              d.parent_id, pd.name as parent_name,
              d.manager_id, u.first_name + ' ' + u.last_name as manager_name
       FROM departments d
       LEFT JOIN departments pd ON d.parent_id = pd.id AND pd.deleted_at IS NULL
       LEFT JOIN users u ON d.manager_id = u.id AND u.deleted_at IS NULL
       WHERE d.id = @id AND d.deleted_at IS NULL`,
      { id: { type: sql.UniqueIdentifier, value: id } },
    );
    if (!result.recordset.length) throw new NotFoundException('دپارتمان یافت نشد');
    return this.mapDept(result.recordset[0]);
  }

  async create(dto: CreateDepartmentDto) {
    const result = await this.db.query<any>(
      `INSERT INTO departments (name, description, manager_id, parent_id)
       OUTPUT INSERTED.id
       VALUES (@name, @description, @managerId, @parentId)`,
      {
        name: { type: sql.NVarChar, value: dto.name },
        description: { type: sql.NVarChar, value: dto.description || null },
        managerId: { type: sql.UniqueIdentifier, value: dto.managerId || null },
        parentId: { type: sql.UniqueIdentifier, value: dto.parentId || null },
      },
    );
    return this.findById(result.recordset[0].id);
  }

  async update(id: string, dto: UpdateDepartmentDto) {
    await this.findById(id);
    const sets: string[] = ['updated_at = GETUTCDATE()'];
    const params: Record<string, any> = { id: { type: sql.UniqueIdentifier, value: id } };

    if (dto.name !== undefined) { sets.push('name = @name'); params.name = { type: sql.NVarChar, value: dto.name }; }
    if (dto.description !== undefined) { sets.push('description = @description'); params.description = { type: sql.NVarChar, value: dto.description }; }
    if (dto.managerId !== undefined) { sets.push('manager_id = @managerId'); params.managerId = { type: sql.UniqueIdentifier, value: dto.managerId || null }; }
    if (dto.parentId !== undefined) { sets.push('parent_id = @parentId'); params.parentId = { type: sql.UniqueIdentifier, value: dto.parentId || null }; }
    if (dto.isActive !== undefined) { sets.push('is_active = @isActive'); params.isActive = { type: sql.Bit, value: dto.isActive ? 1 : 0 }; }

    await this.db.query(`UPDATE departments SET ${sets.join(', ')} WHERE id = @id`, params);
    return this.findById(id);
  }

  async remove(id: string) {
    await this.findById(id);
    await this.db.query(
      `UPDATE departments SET deleted_at = GETUTCDATE(), updated_at = GETUTCDATE() WHERE id = @id`,
      { id: { type: sql.UniqueIdentifier, value: id } },
    );
    return { id };
  }

  private mapDept(d: any) {
    return {
      id: d.id,
      name: d.name,
      description: d.description,
      isActive: d.is_active,
      parentId: d.parent_id,
      parentName: d.parent_name,
      managerId: d.manager_id,
      managerName: d.manager_name,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    };
  }
}
