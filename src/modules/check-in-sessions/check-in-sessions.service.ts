import { Injectable, NotFoundException } from '@nestjs/common';
import * as sql from 'mssql';
import { DatabaseService } from '../../database/database.service';
import { UpdateSessionDto } from './dto/update-session.dto';
import { CheckInFrequency } from '../../common/enums';

@Injectable()
export class CheckInSessionsService {
  constructor(private db: DatabaseService) {}

  async generateForPeriod(periodId: string, frequency: CheckInFrequency): Promise<void> {
    const result = await this.db.query<any>(
      `SELECT start_date, end_date FROM okr_periods WHERE id = @id AND deleted_at IS NULL`,
      { id: { type: sql.UniqueIdentifier, value: periodId } },
    );
    if (!result.recordset.length) {
      throw new Error('دوره یافت نشد');
    }
    const { start_date, end_date } = result.recordset[0];
    await this.generateSessions(periodId, new Date(start_date), new Date(end_date), frequency);
  }

  async generateSessions(
    periodId: string,
    startDate: Date,
    endDate: Date,
    frequency: CheckInFrequency,
  ): Promise<void> {
    // Delete existing sessions for the period first
    await this.db.query(
      `DELETE FROM check_in_sessions WHERE period_id = @periodId`,
      { periodId: { type: sql.UniqueIdentifier, value: periodId } },
    );

    const daysPerSession =
      frequency === CheckInFrequency.WEEKLY
        ? 7
        : frequency === CheckInFrequency.BIWEEKLY
          ? 14
          : 30;

    const sessions: Array<{
      title: string;
      startDate: Date;
      endDate: Date;
      dueDate: Date;
    }> = [];

    let current = new Date(startDate);
    let sessionNum = 1;

    while (current <= endDate) {
      const sessStart = new Date(current);
      const sessEnd = new Date(current);
      sessEnd.setDate(sessEnd.getDate() + daysPerSession - 1);
      if (sessEnd > endDate) sessEnd.setTime(endDate.getTime());

      const dueDate = new Date(sessEnd);
      dueDate.setDate(dueDate.getDate() + 2);

      const label =
        frequency === CheckInFrequency.MONTHLY
          ? `ماه ${sessionNum}`
          : `هفته ${sessionNum}`;

      sessions.push({
        title: label,
        startDate: sessStart,
        endDate: sessEnd,
        dueDate,
      });

      current = new Date(sessEnd);
      current.setDate(current.getDate() + 1);
      sessionNum++;
    }

    for (const s of sessions) {
      const computedStatus = this.computeStatus(s.startDate, s.endDate);
      await this.db.query(
        `INSERT INTO check_in_sessions (period_id, title, start_date, end_date, due_date, status, frequency)
         VALUES (@periodId, @title, @startDate, @endDate, @dueDate, @status, @frequency)`,
        {
          periodId: { type: sql.UniqueIdentifier, value: periodId },
          title: { type: sql.NVarChar, value: s.title },
          startDate: { type: sql.DateTime2, value: s.startDate },
          endDate: { type: sql.DateTime2, value: s.endDate },
          dueDate: { type: sql.DateTime2, value: s.dueDate },
          status: { type: sql.NVarChar, value: computedStatus },
          frequency: { type: sql.NVarChar, value: frequency },
        },
      );
    }
  }

  async findAll(periodId?: string) {
    const where = periodId
      ? 'WHERE s.period_id = @periodId AND p.deleted_at IS NULL'
      : 'WHERE p.deleted_at IS NULL';
    const params: Record<string, any> = periodId
      ? { periodId: { type: sql.UniqueIdentifier, value: periodId } }
      : {};

    const result = await this.db.query<any>(
      `SELECT s.id, s.period_id, s.title, s.start_date, s.end_date, s.due_date,
              s.status, s.frequency, s.created_at,
              p.title as period_title, p.year, p.quarter
       FROM check_in_sessions s
       INNER JOIN okr_periods p ON s.period_id = p.id
       ${where}
       ORDER BY s.start_date ASC`,
      params,
    );
    return result.recordset.map(this.mapSession);
  }

  async findCurrent() {
    const result = await this.db.query<any>(
      `SELECT s.id, s.period_id, s.title, s.start_date, s.end_date, s.due_date,
              s.status, s.frequency, s.created_at,
              p.title as period_title, p.year, p.quarter
       FROM check_in_sessions s
       INNER JOIN okr_periods p ON s.period_id = p.id
       WHERE s.start_date <= GETUTCDATE() AND s.end_date >= GETUTCDATE()
       ORDER BY s.start_date DESC`,
    );
    if (!result.recordset.length) return null;
    return this.mapSession(result.recordset[0]);
  }

  async findById(id: string) {
    const result = await this.db.query<any>(
      `SELECT s.id, s.period_id, s.title, s.start_date, s.end_date, s.due_date,
              s.status, s.frequency, s.created_at,
              p.title as period_title, p.year, p.quarter
       FROM check_in_sessions s
       INNER JOIN okr_periods p ON s.period_id = p.id
       WHERE s.id = @id`,
      { id: { type: sql.UniqueIdentifier, value: id } },
    );
    if (!result.recordset.length) throw new NotFoundException('جلسه چک‌این یافت نشد');
    return this.mapSession(result.recordset[0]);
  }

  async update(id: string, dto: UpdateSessionDto) {
    await this.findById(id);
    const sets: string[] = ['updated_at = GETUTCDATE()'];
    const params: Record<string, any> = { id: { type: sql.UniqueIdentifier, value: id } };

    if (dto.title !== undefined) { sets.push('title = @title'); params.title = { type: sql.NVarChar, value: dto.title }; }
    if (dto.startDate !== undefined) { sets.push('start_date = @startDate'); params.startDate = { type: sql.DateTime2, value: new Date(dto.startDate) }; }
    if (dto.endDate !== undefined) { sets.push('end_date = @endDate'); params.endDate = { type: sql.DateTime2, value: new Date(dto.endDate) }; }
    if (dto.dueDate !== undefined) { sets.push('due_date = @dueDate'); params.dueDate = { type: sql.DateTime2, value: new Date(dto.dueDate) }; }
    if (dto.status !== undefined) { sets.push('status = @status'); params.status = { type: sql.NVarChar, value: dto.status }; }

    await this.db.query(
      `UPDATE check_in_sessions SET ${sets.join(', ')} WHERE id = @id`,
      params,
    );
    return this.findById(id);
  }

  async remove(id: string) {
    await this.findById(id);
    const idParam = { id: { type: sql.UniqueIdentifier, value: id } };
    // Null tasks.minutes_id that reference minutes of this session
    await this.db.query(
      `UPDATE tasks SET minutes_id = NULL
       WHERE minutes_id IN (SELECT sm.id FROM session_minutes sm WHERE sm.session_id = @id)`,
      idParam,
    );
    // Delete session minutes
    await this.db.query(`DELETE FROM session_minutes WHERE session_id = @id`, idParam);
    // Null check_ins references
    await this.db.query(`UPDATE check_ins SET session_id = NULL WHERE session_id = @id`, idParam);
    // Hard delete session
    await this.db.query(`DELETE FROM check_in_sessions WHERE id = @id`, idParam);
  }

  async findKrsForSession(sessionId: string, currentUserId: string) {
    const sessionResult = await this.db.query<any>(
      `SELECT period_id FROM check_in_sessions WHERE id = @id`,
      { id: { type: sql.UniqueIdentifier, value: sessionId } },
    );
    if (!sessionResult.recordset.length) throw new NotFoundException('جلسه یافت نشد');
    const periodId = sessionResult.recordset[0].period_id;

    const result = await this.db.query<any>(
      `SELECT kr.id, kr.title, kr.description, kr.current_value, kr.target_value, kr.start_value,
              kr.unit, kr.progress, kr.status,
              kr.owner_id, u.first_name + ' ' + u.last_name as owner_name,
              o.id as objective_id, o.title as objective_title,
              CASE WHEN ci.id IS NOT NULL THEN 1 ELSE 0 END as has_checked_in,
              ci.value as last_check_in_value,
              ci.note as last_check_in_note
       FROM key_results kr
       INNER JOIN objectives o ON kr.objective_id = o.id
       INNER JOIN users u ON kr.owner_id = u.id
       LEFT JOIN check_ins ci ON ci.key_result_id = kr.id AND ci.session_id = @sessionId
       WHERE kr.deleted_at IS NULL
         AND o.deleted_at IS NULL
         AND o.period_id = @periodId
       ORDER BY o.title, kr.title`,
      {
        sessionId: { type: sql.UniqueIdentifier, value: sessionId },
        periodId: { type: sql.UniqueIdentifier, value: periodId },
      },
    );

    return result.recordset.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      currentValue: Number(r.current_value),
      targetValue: Number(r.target_value),
      startValue: Number(r.start_value),
      unit: r.unit,
      progress: Number(r.progress),
      status: r.status,
      ownerId: r.owner_id,
      ownerName: r.owner_name,
      objectiveId: r.objective_id,
      objectiveTitle: r.objective_title,
      hasCheckedIn: !!r.has_checked_in,
      lastCheckInValue: r.last_check_in_value != null ? Number(r.last_check_in_value) : undefined,
      lastCheckInNote: r.last_check_in_note,
      isMyKr: String(r.owner_id) === String(currentUserId),
    }));
  }

  async getCompletionByDepartment(sessionId: string) {
    const result = await this.db.query<any>(
      `SELECT
         d.id as department_id,
         d.name as department_name,
         COUNT(DISTINCT kr.id) as total_krs,
         COUNT(DISTINCT ci.key_result_id) as submitted_krs
       FROM departments d
       LEFT JOIN users u ON u.department_id = d.id AND u.deleted_at IS NULL
       LEFT JOIN objectives o ON o.owner_id = u.id AND o.deleted_at IS NULL
       LEFT JOIN key_results kr ON kr.objective_id = o.id AND kr.deleted_at IS NULL
       LEFT JOIN check_ins ci ON ci.key_result_id = kr.id AND ci.session_id = @sessionId
       WHERE d.deleted_at IS NULL
       GROUP BY d.id, d.name
       ORDER BY d.name`,
      { sessionId: { type: sql.UniqueIdentifier, value: sessionId } },
    );

    return result.recordset.map((r) => ({
      departmentId: r.department_id,
      departmentName: r.department_name,
      totalKrs: r.total_krs || 0,
      submittedKrs: r.submitted_krs || 0,
      completionPercent:
        r.total_krs > 0
          ? Math.round((r.submitted_krs / r.total_krs) * 100)
          : 0,
    }));
  }

  private computeStatus(startDate: Date, endDate: Date): string {
    const today = new Date();
    if (today < startDate) return 'locked';
    if (today <= endDate) return 'open';
    return 'closed';
  }

  private mapSession = (s: any) => ({
    id: s.id,
    periodId: s.period_id,
    periodTitle: s.period_title,
    periodYear: s.year,
    periodQuarter: s.quarter,
    title: s.title,
    startDate: s.start_date,
    endDate: s.end_date,
    dueDate: s.due_date,
    status: this.computeStatus(new Date(s.start_date), new Date(s.end_date)),
    frequency: s.frequency,
    createdAt: s.created_at,
  });
}
