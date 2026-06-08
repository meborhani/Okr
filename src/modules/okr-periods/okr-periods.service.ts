import {
  Injectable, NotFoundException, BadRequestException, ConflictException,
} from '@nestjs/common';
import * as sql from 'mssql';
import { DatabaseService } from '../../database/database.service';
import { CreateOkrPeriodDto } from './dto/create-okr-period.dto';
import { UpdateOkrPeriodDto } from './dto/update-okr-period.dto';
import { OkrPeriodStatus } from '../../common/enums';

@Injectable()
export class OkrPeriodsService {
  constructor(private db: DatabaseService) {}

  async findAll() {
    const result = await this.db.query<any>(
      `SELECT id, title, year, quarter, start_date, end_date, status, description, created_at
       FROM okr_periods WHERE deleted_at IS NULL ORDER BY year DESC, quarter DESC`,
    );
    return result.recordset.map(this.mapPeriod);
  }

  async findActive() {
    const result = await this.db.query<any>(
      `SELECT id, title, year, quarter, start_date, end_date, status, description, created_at
       FROM okr_periods WHERE status = 'active' AND deleted_at IS NULL`,
    );
    return result.recordset.map(this.mapPeriod);
  }

  async findById(id: string) {
    const result = await this.db.query<any>(
      `SELECT id, title, year, quarter, start_date, end_date, status, description,
              created_at, updated_at, created_by
       FROM okr_periods WHERE id = @id AND deleted_at IS NULL`,
      { id: { type: sql.UniqueIdentifier, value: id } },
    );
    if (!result.recordset.length) throw new NotFoundException('دوره OKR یافت نشد');
    return this.mapPeriod(result.recordset[0]);
  }

  async create(dto: CreateOkrPeriodDto, userId: string) {
    const existing = await this.db.query<any>(
      `SELECT id FROM okr_periods WHERE year = @year AND quarter = @quarter AND deleted_at IS NULL`,
      {
        year: { type: sql.Int, value: dto.year },
        quarter: { type: sql.Int, value: dto.quarter },
      },
    );
    if (existing.recordset.length) {
      throw new ConflictException(`دوره فصل ${dto.quarter} سال ${dto.year} قبلاً تعریف شده است`);
    }

    const result = await this.db.query<any>(
      `INSERT INTO okr_periods (title, year, quarter, start_date, end_date, description, created_by)
       OUTPUT INSERTED.id
       VALUES (@title, @year, @quarter, @startDate, @endDate, @description, @createdBy)`,
      {
        title: { type: sql.NVarChar, value: dto.title },
        year: { type: sql.Int, value: dto.year },
        quarter: { type: sql.Int, value: dto.quarter },
        startDate: { type: sql.DateTime2, value: new Date(dto.startDate) },
        endDate: { type: sql.DateTime2, value: new Date(dto.endDate) },
        description: { type: sql.NVarChar, value: dto.description || null },
        createdBy: { type: sql.UniqueIdentifier, value: userId },
      },
    );
    return this.findById(result.recordset[0].id);
  }

  async update(id: string, dto: UpdateOkrPeriodDto) {
    const period = await this.findById(id);
    if (period.status !== OkrPeriodStatus.DRAFT) {
      throw new BadRequestException('فقط دوره‌های در حالت پیش‌نویس قابل ویرایش هستند');
    }

    const sets: string[] = ['updated_at = GETUTCDATE()'];
    const params: Record<string, any> = { id: { type: sql.UniqueIdentifier, value: id } };

    if (dto.title !== undefined) { sets.push('title = @title'); params.title = { type: sql.NVarChar, value: dto.title }; }
    if (dto.startDate !== undefined) { sets.push('start_date = @startDate'); params.startDate = { type: sql.DateTime2, value: new Date(dto.startDate) }; }
    if (dto.endDate !== undefined) { sets.push('end_date = @endDate'); params.endDate = { type: sql.DateTime2, value: new Date(dto.endDate) }; }
    if (dto.description !== undefined) { sets.push('description = @description'); params.description = { type: sql.NVarChar, value: dto.description }; }

    await this.db.query(`UPDATE okr_periods SET ${sets.join(', ')} WHERE id = @id`, params);
    return this.findById(id);
  }

  async activate(id: string) {
    const period = await this.findById(id);
    if (period.status !== OkrPeriodStatus.DRAFT) {
      throw new BadRequestException('فقط دوره‌های پیش‌نویس قابل فعال‌سازی هستند');
    }
    await this.db.query(
      `UPDATE okr_periods SET status = 'active', updated_at = GETUTCDATE() WHERE id = @id`,
      { id: { type: sql.UniqueIdentifier, value: id } },
    );
    return this.findById(id);
  }

  async close(id: string) {
    const period = await this.findById(id);
    if (period.status !== OkrPeriodStatus.ACTIVE) {
      throw new BadRequestException('فقط دوره‌های فعال قابل بستن هستند');
    }
    await this.db.query(
      `UPDATE okr_periods SET status = 'closed', updated_at = GETUTCDATE() WHERE id = @id`,
      { id: { type: sql.UniqueIdentifier, value: id } },
    );
    return this.findById(id);
  }

  async archive(id: string) {
    const period = await this.findById(id);
    if (period.status !== OkrPeriodStatus.CLOSED) {
      throw new BadRequestException('فقط دوره‌های بسته شده قابل آرشیو هستند');
    }
    await this.db.query(
      `UPDATE okr_periods SET status = 'archived', updated_at = GETUTCDATE() WHERE id = @id`,
      { id: { type: sql.UniqueIdentifier, value: id } },
    );
    return this.findById(id);
  }

  private mapPeriod(p: any) {
    return {
      id: p.id,
      title: p.title,
      year: p.year,
      quarter: p.quarter,
      startDate: p.start_date,
      endDate: p.end_date,
      status: p.status,
      description: p.description,
      createdBy: p.created_by,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    };
  }
}
