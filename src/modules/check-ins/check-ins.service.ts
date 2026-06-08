import { Injectable } from '@nestjs/common';
import * as sql from 'mssql';
import { DatabaseService } from '../../database/database.service';
import { KeyResultsService } from '../key-results/key-results.service';
import { CreateCheckInDto } from './dto/create-check-in.dto';

@Injectable()
export class CheckInsService {
  constructor(
    private db: DatabaseService,
    private keyResultsService: KeyResultsService,
  ) {}

  async findAll(keyResultId?: string) {
    const where = keyResultId
      ? 'ci.key_result_id = @keyResultId'
      : '1=1';
    const params: Record<string, any> = keyResultId
      ? { keyResultId: { type: sql.UniqueIdentifier, value: keyResultId } }
      : {};

    const result = await this.db.query<any>(
      `SELECT ci.id, ci.value, ci.note, ci.check_date, ci.created_at,
              ci.key_result_id, kr.title as key_result_title,
              ci.checked_by, u.first_name + ' ' + u.last_name as checked_by_name
       FROM check_ins ci
       INNER JOIN key_results kr ON ci.key_result_id = kr.id
       INNER JOIN users u ON ci.checked_by = u.id
       WHERE ${where}
       ORDER BY ci.check_date DESC`,
      params,
    );
    return result.recordset.map(this.mapCheckIn);
  }

  async findByKeyResult(keyResultId: string) {
    return this.findAll(keyResultId);
  }

  async create(dto: CreateCheckInDto, userId: string) {
    await this.db.query(
      `INSERT INTO check_ins (key_result_id, checked_by, value, note, check_date)
       VALUES (@keyResultId, @checkedBy, @value, @note, @checkDate)`,
      {
        keyResultId: { type: sql.UniqueIdentifier, value: dto.keyResultId },
        checkedBy: { type: sql.UniqueIdentifier, value: userId },
        value: { type: sql.Decimal(18, 4), value: dto.value },
        note: { type: sql.NVarChar, value: dto.note || null },
        checkDate: { type: sql.DateTime2, value: dto.checkDate ? new Date(dto.checkDate) : new Date() },
      },
    );

    await this.keyResultsService.updateCurrentValue(dto.keyResultId, dto.value);

    return this.findAll(dto.keyResultId).then((list) => list[0]);
  }

  private mapCheckIn(ci: any) {
    return {
      id: ci.id,
      value: Number(ci.value),
      note: ci.note,
      checkDate: ci.check_date,
      keyResultId: ci.key_result_id,
      keyResultTitle: ci.key_result_title,
      checkedBy: ci.checked_by,
      checkedByName: ci.checked_by_name,
      createdAt: ci.created_at,
    };
  }
}
