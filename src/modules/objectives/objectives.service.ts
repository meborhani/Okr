import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as sql from 'mssql';
import { DatabaseService } from '../../database/database.service';
import { CreateObjectiveDto } from './dto/create-objective.dto';
import { UpdateObjectiveDto } from './dto/update-objective.dto';
import { calculateObjectiveProgress } from '../../common/utils/okr.utils';

@Injectable()
export class ObjectivesService {
  constructor(private db: DatabaseService) {}

  async findAll(periodId?: string, ownerId?: string) {
    let where = 'o.deleted_at IS NULL';
    const params: Record<string, any> = {};

    if (periodId) {
      where += ' AND o.period_id = @periodId';
      params.periodId = { type: sql.UniqueIdentifier, value: periodId };
    }
    if (ownerId) {
      where += ' AND o.owner_id = @ownerId';
      params.ownerId = { type: sql.UniqueIdentifier, value: ownerId };
    }

    const result = await this.db.query<any>(
      `SELECT o.id, o.title, o.description, o.status, o.progress, o.weight, o.scope,
              o.period_id, op.title as period_title,
              o.owner_id, u.first_name + ' ' + u.last_name as owner_name,
              o.department_id, d.name as department_name,
              o.team_id, t.name as team_name,
              o.parent_id, po.title as parent_title,
              o.created_at, o.updated_at
       FROM objectives o
       INNER JOIN okr_periods op ON o.period_id = op.id
       INNER JOIN users u ON o.owner_id = u.id
       LEFT JOIN departments d ON o.department_id = d.id AND d.deleted_at IS NULL
       LEFT JOIN teams t ON o.team_id = t.id AND t.deleted_at IS NULL
       LEFT JOIN objectives po ON o.parent_id = po.id AND po.deleted_at IS NULL
       WHERE ${where}
       ORDER BY o.created_at DESC`,
      params,
    );
    return result.recordset.map(this.mapObjective);
  }

  async findById(id: string) {
    const result = await this.db.query<any>(
      `SELECT o.id, o.title, o.description, o.status, o.progress, o.weight, o.scope,
              o.period_id, op.title as period_title,
              o.owner_id, u.first_name + ' ' + u.last_name as owner_name,
              o.department_id, d.name as department_name,
              o.team_id, t.name as team_name,
              o.parent_id, po.title as parent_title,
              o.created_at, o.updated_at
       FROM objectives o
       INNER JOIN okr_periods op ON o.period_id = op.id
       INNER JOIN users u ON o.owner_id = u.id
       LEFT JOIN departments d ON o.department_id = d.id AND d.deleted_at IS NULL
       LEFT JOIN teams t ON o.team_id = t.id AND t.deleted_at IS NULL
       LEFT JOIN objectives po ON o.parent_id = po.id AND po.deleted_at IS NULL
       WHERE o.id = @id AND o.deleted_at IS NULL`,
      { id: { type: sql.UniqueIdentifier, value: id } },
    );
    if (!result.recordset.length) throw new NotFoundException('هدف یافت نشد');
    return this.mapObjective(result.recordset[0]);
  }

  async create(dto: CreateObjectiveDto) {
    const result = await this.db.query<any>(
      `INSERT INTO objectives (title, description, period_id, owner_id, department_id, team_id, parent_id, weight, scope)
       OUTPUT INSERTED.id
       VALUES (@title, @description, @periodId, @ownerId, @departmentId, @teamId, @parentId, @weight, @scope)`,
      {
        title: { type: sql.NVarChar, value: dto.title },
        description: { type: sql.NVarChar, value: dto.description || null },
        periodId: { type: sql.UniqueIdentifier, value: dto.periodId },
        ownerId: { type: sql.UniqueIdentifier, value: dto.ownerId },
        departmentId: { type: sql.UniqueIdentifier, value: dto.departmentId || null },
        teamId: { type: sql.UniqueIdentifier, value: dto.teamId || null },
        parentId: { type: sql.UniqueIdentifier, value: dto.parentId || null },
        weight: { type: sql.Decimal(5, 2), value: dto.weight || 1 },
        scope: { type: sql.NVarChar, value: dto.scope || 'organization' },
      },
    );
    return this.findById(result.recordset[0].id);
  }

  async update(id: string, dto: UpdateObjectiveDto) {
    await this.findById(id);
    const sets: string[] = ['updated_at = GETUTCDATE()'];
    const params: Record<string, any> = { id: { type: sql.UniqueIdentifier, value: id } };

    if (dto.title !== undefined) { sets.push('title = @title'); params.title = { type: sql.NVarChar, value: dto.title }; }
    if (dto.description !== undefined) { sets.push('description = @description'); params.description = { type: sql.NVarChar, value: dto.description }; }
    if (dto.ownerId !== undefined) { sets.push('owner_id = @ownerId'); params.ownerId = { type: sql.UniqueIdentifier, value: dto.ownerId }; }
    if (dto.departmentId !== undefined) { sets.push('department_id = @departmentId'); params.departmentId = { type: sql.UniqueIdentifier, value: dto.departmentId || null }; }
    if (dto.teamId !== undefined) { sets.push('team_id = @teamId'); params.teamId = { type: sql.UniqueIdentifier, value: dto.teamId || null }; }
    if (dto.status !== undefined) { sets.push('status = @status'); params.status = { type: sql.NVarChar, value: dto.status }; }
    if (dto.weight !== undefined) { sets.push('weight = @weight'); params.weight = { type: sql.Decimal(5, 2), value: dto.weight }; }
    if (dto.scope !== undefined) { sets.push('scope = @scope'); params.scope = { type: sql.NVarChar, value: dto.scope }; }

    await this.db.query(`UPDATE objectives SET ${sets.join(', ')} WHERE id = @id`, params);
    return this.findById(id);
  }

  async remove(id: string) {
    await this.findById(id);
    await this.db.query(
      `UPDATE key_results SET deleted_at = GETUTCDATE(), updated_at = GETUTCDATE()
       WHERE objective_id = @id AND deleted_at IS NULL`,
      { id: { type: sql.UniqueIdentifier, value: id } },
    );
    await this.db.query(
      `UPDATE objectives SET deleted_at = GETUTCDATE(), updated_at = GETUTCDATE() WHERE id = @id`,
      { id: { type: sql.UniqueIdentifier, value: id } },
    );
    return { id };
  }

  async recalculateProgress(objectiveId: string) {
    const krResult = await this.db.query<{ progress: number }>(
      `SELECT progress FROM key_results WHERE objective_id = @id AND deleted_at IS NULL`,
      { id: { type: sql.UniqueIdentifier, value: objectiveId } },
    );

    if (krResult.recordset.length === 0) return;

    const progresses = krResult.recordset.map((r) => Number(r.progress));
    const avgProgress = calculateObjectiveProgress(progresses);

    await this.db.query(
      `UPDATE objectives SET progress = @progress, updated_at = GETUTCDATE() WHERE id = @id`,
      {
        id: { type: sql.UniqueIdentifier, value: objectiveId },
        progress: { type: sql.Decimal(5, 2), value: avgProgress },
      },
    );
  }

  private mapObjective(o: any) {
    return {
      id: o.id,
      title: o.title,
      description: o.description,
      status: o.status,
      progress: Number(o.progress),
      weight: Number(o.weight),
      scope: o.scope || 'organization',
      periodId: o.period_id,
      periodTitle: o.period_title,
      ownerId: o.owner_id,
      ownerName: o.owner_name,
      departmentId: o.department_id,
      departmentName: o.department_name,
      teamId: o.team_id,
      teamName: o.team_name,
      parentId: o.parent_id,
      parentTitle: o.parent_title,
      createdAt: o.created_at,
      updatedAt: o.updated_at,
    };
  }
}
