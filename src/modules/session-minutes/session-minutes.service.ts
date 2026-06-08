import { Injectable, ForbiddenException } from '@nestjs/common';
import * as sql from 'mssql';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class SessionMinutesService {
  constructor(private db: DatabaseService) {}

  async findAll() {
    const result = await this.db.query<any>(
      `SELECT m.id, m.session_id, m.content, m.created_at, m.updated_at,
              cs.title as session_title, cs.start_date, cs.end_date,
              op.title as period_title, op.year as period_year, op.quarter as period_quarter,
              cb.first_name + ' ' + cb.last_name as created_by_name
       FROM session_minutes m
       INNER JOIN check_in_sessions cs ON m.session_id = cs.id
       INNER JOIN okr_periods op ON cs.period_id = op.id
       LEFT JOIN users cb ON m.created_by = cb.id
       ORDER BY cs.start_date DESC`,
    );
    return result.recordset.map((m: any) => ({
      id: m.id,
      sessionId: m.session_id,
      content: m.content || '',
      sessionTitle: m.session_title,
      sessionStartDate: m.start_date,
      sessionEndDate: m.end_date,
      periodTitle: m.period_title,
      periodYear: m.period_year,
      periodQuarter: m.period_quarter,
      createdByName: m.created_by_name,
      createdAt: m.created_at,
      updatedAt: m.updated_at,
    }));
  }

  async findBySession(sessionId: string) {
    const result = await this.db.query<any>(
      `SELECT m.id, m.session_id, m.content, m.created_at, m.updated_at,
              cb.first_name + ' ' + cb.last_name as created_by_name,
              ub.first_name + ' ' + ub.last_name as updated_by_name
       FROM session_minutes m
       LEFT JOIN users cb ON m.created_by = cb.id
       LEFT JOIN users ub ON m.updated_by = ub.id
       WHERE m.session_id = @sessionId`,
      { sessionId: { type: sql.UniqueIdentifier, value: sessionId } },
    );
    if (!result.recordset.length) return null;
    return this.map(result.recordset[0]);
  }

  async upsert(sessionId: string, content: string, userId: string, isAdmin: boolean) {
    if (!isAdmin) throw new ForbiddenException('فقط مدیر سیستم می‌تواند صورت جلسه را ویرایش کند');

    const existing = await this.findBySession(sessionId);
    if (!existing) {
      await this.db.query(
        `INSERT INTO session_minutes (session_id, content, created_by, updated_by)
         VALUES (@sessionId, @content, @userId, @userId)`,
        {
          sessionId: { type: sql.UniqueIdentifier, value: sessionId },
          content: { type: sql.NVarChar, value: content },
          userId: { type: sql.UniqueIdentifier, value: userId },
        },
      );
    } else {
      await this.db.query(
        `UPDATE session_minutes SET content = @content, updated_by = @userId, updated_at = GETUTCDATE()
         WHERE session_id = @sessionId`,
        {
          sessionId: { type: sql.UniqueIdentifier, value: sessionId },
          content: { type: sql.NVarChar, value: content },
          userId: { type: sql.UniqueIdentifier, value: userId },
        },
      );
    }
    return this.findBySession(sessionId);
  }

  private map(m: any) {
    return {
      id: m.id,
      sessionId: m.session_id,
      content: m.content || '',
      createdAt: m.created_at,
      updatedAt: m.updated_at,
      createdByName: m.created_by_name,
      updatedByName: m.updated_by_name,
    };
  }
}
