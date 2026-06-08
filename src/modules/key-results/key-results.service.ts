import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as sql from 'mssql';
import { DatabaseService } from '../../database/database.service';
import { ObjectivesService } from '../objectives/objectives.service';
import { CreateKeyResultDto } from './dto/create-key-result.dto';
import { UpdateKeyResultDto } from './dto/update-key-result.dto';
import { calculateProgress } from '../../common/utils/okr.utils';

@Injectable()
export class KeyResultsService {
  constructor(
    private db: DatabaseService,
    private objectivesService: ObjectivesService,
  ) {}

  async findAll(objectiveId?: string, ownerId?: string) {
    let where = 'kr.deleted_at IS NULL';
    const params: Record<string, any> = {};

    if (objectiveId) {
      where += ' AND kr.objective_id = @objectiveId';
      params.objectiveId = { type: sql.UniqueIdentifier, value: objectiveId };
    }
    if (ownerId) {
      where += ' AND kr.owner_id = @ownerId';
      params.ownerId = { type: sql.UniqueIdentifier, value: ownerId };
    }

    const result = await this.db.query<any>(
      `SELECT kr.id, kr.title, kr.description, kr.status, kr.progress,
              kr.start_value, kr.target_value, kr.current_value, kr.unit, kr.weight,
              kr.objective_id, o.title as objective_title,
              kr.owner_id, u.first_name + ' ' + u.last_name as owner_name,
              kr.created_at, kr.updated_at
       FROM key_results kr
       INNER JOIN objectives o ON kr.objective_id = o.id
       INNER JOIN users u ON kr.owner_id = u.id
       WHERE ${where}
       ORDER BY kr.created_at DESC`,
      params,
    );
    return result.recordset.map(this.mapKr);
  }

  async findById(id: string) {
    const result = await this.db.query<any>(
      `SELECT kr.id, kr.title, kr.description, kr.status, kr.progress,
              kr.start_value, kr.target_value, kr.current_value, kr.unit, kr.weight,
              kr.objective_id, o.title as objective_title,
              kr.owner_id, u.first_name + ' ' + u.last_name as owner_name,
              kr.created_at, kr.updated_at
       FROM key_results kr
       INNER JOIN objectives o ON kr.objective_id = o.id
       INNER JOIN users u ON kr.owner_id = u.id
       WHERE kr.id = @id AND kr.deleted_at IS NULL`,
      { id: { type: sql.UniqueIdentifier, value: id } },
    );
    if (!result.recordset.length) throw new NotFoundException('نتیجه کلیدی یافت نشد');
    return this.mapKr(result.recordset[0]);
  }

  async create(dto: CreateKeyResultDto) {
    if (dto.targetValue === dto.startValue) {
      throw new BadRequestException('مقدار هدف نمی‌تواند برابر با مقدار شروع باشد');
    }

    const result = await this.db.query<any>(
      `INSERT INTO key_results (title, description, objective_id, owner_id, start_value, target_value, current_value, unit, weight)
       OUTPUT INSERTED.id
       VALUES (@title, @description, @objectiveId, @ownerId, @startValue, @targetValue, @startValue, @unit, @weight)`,
      {
        title: { type: sql.NVarChar, value: dto.title },
        description: { type: sql.NVarChar, value: dto.description || null },
        objectiveId: { type: sql.UniqueIdentifier, value: dto.objectiveId },
        ownerId: { type: sql.UniqueIdentifier, value: dto.ownerId },
        startValue: { type: sql.Decimal(18, 4), value: dto.startValue },
        targetValue: { type: sql.Decimal(18, 4), value: dto.targetValue },
        unit: { type: sql.NVarChar, value: dto.unit || null },
        weight: { type: sql.Decimal(5, 2), value: dto.weight || 1 },
      },
    );
    return this.findById(result.recordset[0].id);
  }

  async update(id: string, dto: UpdateKeyResultDto) {
    const kr = await this.findById(id);
    const sets: string[] = ['updated_at = GETUTCDATE()'];
    const params: Record<string, any> = { id: { type: sql.UniqueIdentifier, value: id } };

    if (dto.title !== undefined) { sets.push('title = @title'); params.title = { type: sql.NVarChar, value: dto.title }; }
    if (dto.description !== undefined) { sets.push('description = @description'); params.description = { type: sql.NVarChar, value: dto.description }; }
    if (dto.ownerId !== undefined) { sets.push('owner_id = @ownerId'); params.ownerId = { type: sql.UniqueIdentifier, value: dto.ownerId }; }
    if (dto.targetValue !== undefined) {
      if (dto.targetValue === kr.startValue) {
        throw new BadRequestException('مقدار هدف نمی‌تواند برابر با مقدار شروع باشد');
      }
      sets.push('target_value = @targetValue');
      params.targetValue = { type: sql.Decimal(18, 4), value: dto.targetValue };
      const newProgress = calculateProgress(kr.currentValue, kr.startValue, dto.targetValue);
      sets.push('progress = @progress');
      params.progress = { type: sql.Decimal(5, 2), value: newProgress };
    }
    if (dto.unit !== undefined) { sets.push('unit = @unit'); params.unit = { type: sql.NVarChar, value: dto.unit }; }
    if (dto.status !== undefined) { sets.push('status = @status'); params.status = { type: sql.NVarChar, value: dto.status }; }
    if (dto.weight !== undefined) { sets.push('weight = @weight'); params.weight = { type: sql.Decimal(5, 2), value: dto.weight }; }

    await this.db.query(`UPDATE key_results SET ${sets.join(', ')} WHERE id = @id`, params);

    await this.objectivesService.recalculateProgress(kr.objectiveId);
    return this.findById(id);
  }

  async remove(id: string) {
    const kr = await this.findById(id);
    await this.db.query(
      `UPDATE key_results SET deleted_at = GETUTCDATE(), updated_at = GETUTCDATE() WHERE id = @id`,
      { id: { type: sql.UniqueIdentifier, value: id } },
    );
    await this.objectivesService.recalculateProgress(kr.objectiveId);
    return { id };
  }

  async getCheckIns(keyResultId: string) {
    const result = await this.db.query<any>(
      `SELECT ci.id, ci.value, ci.note, ci.check_date, ci.created_at,
              ci.checked_by, u.first_name + ' ' + u.last_name as checked_by_name
       FROM check_ins ci
       INNER JOIN users u ON ci.checked_by = u.id
       WHERE ci.key_result_id = @keyResultId
       ORDER BY ci.check_date DESC`,
      { keyResultId: { type: sql.UniqueIdentifier, value: keyResultId } },
    );
    return result.recordset.map((ci) => ({
      id: ci.id,
      value: Number(ci.value),
      note: ci.note,
      checkDate: ci.check_date,
      checkedBy: ci.checked_by,
      checkedByName: ci.checked_by_name,
      createdAt: ci.created_at,
    }));
  }

  async updateCurrentValue(id: string, value: number) {
    const kr = await this.findById(id);
    const progress = calculateProgress(value, kr.startValue, kr.targetValue);

    await this.db.query(
      `UPDATE key_results SET current_value = @value, progress = @progress, updated_at = GETUTCDATE() WHERE id = @id`,
      {
        id: { type: sql.UniqueIdentifier, value: id },
        value: { type: sql.Decimal(18, 4), value },
        progress: { type: sql.Decimal(5, 2), value: progress },
      },
    );

    await this.objectivesService.recalculateProgress(kr.objectiveId);
    return this.findById(id);
  }

  private mapKr(kr: any) {
    return {
      id: kr.id,
      title: kr.title,
      description: kr.description,
      status: kr.status,
      progress: Number(kr.progress),
      startValue: Number(kr.start_value),
      targetValue: Number(kr.target_value),
      currentValue: Number(kr.current_value),
      unit: kr.unit,
      weight: Number(kr.weight),
      objectiveId: kr.objective_id,
      objectiveTitle: kr.objective_title,
      ownerId: kr.owner_id,
      ownerName: kr.owner_name,
      createdAt: kr.created_at,
      updatedAt: kr.updated_at,
    };
  }
}
