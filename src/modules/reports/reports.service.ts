import { Injectable } from '@nestjs/common';
import * as sql from 'mssql';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class ReportsService {
  constructor(private db: DatabaseService) {}

  async getDashboard(periodId?: string) {
    const periodFilter = periodId
      ? 'AND o.period_id = @periodId'
      : '';
    const params: Record<string, any> = periodId
      ? { periodId: { type: sql.UniqueIdentifier, value: periodId } }
      : {};

    const objectiveStats = await this.db.query<any>(
      `SELECT
         COUNT(*) as total_objectives,
         SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_objectives,
         SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_objectives,
         SUM(CASE WHEN status = 'at_risk' THEN 1 ELSE 0 END) as at_risk_objectives,
         AVG(CAST(progress AS FLOAT)) as avg_progress
       FROM objectives
       WHERE deleted_at IS NULL ${periodFilter}`,
      params,
    );

    const keyResultStats = await this.db.query<any>(
      `SELECT
         COUNT(*) as total_key_results,
         SUM(CASE WHEN kr.status = 'completed' THEN 1 ELSE 0 END) as completed_key_results,
         SUM(CASE WHEN kr.status = 'on_track' THEN 1 ELSE 0 END) as on_track_key_results,
         SUM(CASE WHEN kr.status = 'at_risk' THEN 1 ELSE 0 END) as at_risk_key_results,
         SUM(CASE WHEN kr.status = 'off_track' THEN 1 ELSE 0 END) as off_track_key_results,
         AVG(CAST(kr.progress AS FLOAT)) as avg_progress
       FROM key_results kr
       INNER JOIN objectives o ON kr.objective_id = o.id
       WHERE kr.deleted_at IS NULL AND o.deleted_at IS NULL ${periodFilter}`,
      params,
    );

    const activePeriods = await this.db.query<any>(
      `SELECT id, title, year, quarter, status FROM okr_periods WHERE status = 'active' AND deleted_at IS NULL`,
    );

    return {
      activePeriods: activePeriods.recordset,
      objectives: objectiveStats.recordset[0],
      keyResults: keyResultStats.recordset[0],
    };
  }

  async getTeamProgress(periodId?: string) {
    const periodFilter = periodId ? 'AND o.period_id = @periodId' : '';
    const params: Record<string, any> = periodId
      ? { periodId: { type: sql.UniqueIdentifier, value: periodId } }
      : {};

    const result = await this.db.query<any>(
      `SELECT
         t.id as team_id,
         t.name as team_name,
         COUNT(DISTINCT o.id) as total_objectives,
         AVG(CAST(o.progress AS FLOAT)) as avg_objective_progress,
         COUNT(DISTINCT kr.id) as total_key_results,
         AVG(CAST(kr.progress AS FLOAT)) as avg_key_result_progress
       FROM teams t
       LEFT JOIN objectives o ON o.team_id = t.id AND o.deleted_at IS NULL ${periodFilter}
       LEFT JOIN key_results kr ON kr.objective_id = o.id AND kr.deleted_at IS NULL
       WHERE t.deleted_at IS NULL
       GROUP BY t.id, t.name
       ORDER BY avg_objective_progress DESC`,
      params,
    );

    return result.recordset.map((r) => ({
      teamId: r.team_id,
      teamName: r.team_name,
      totalObjectives: r.total_objectives,
      avgObjectiveProgress: r.avg_objective_progress ? Math.round(r.avg_objective_progress * 100) / 100 : 0,
      totalKeyResults: r.total_key_results,
      avgKeyResultProgress: r.avg_key_result_progress ? Math.round(r.avg_key_result_progress * 100) / 100 : 0,
    }));
  }

  async getUserProgress(periodId?: string) {
    const periodFilter = periodId ? 'AND o.period_id = @periodId' : '';
    const params: Record<string, any> = periodId
      ? { periodId: { type: sql.UniqueIdentifier, value: periodId } }
      : {};

    const result = await this.db.query<any>(
      `SELECT
         u.id as user_id,
         u.first_name + ' ' + u.last_name as user_name,
         u.email,
         r.display_name as role,
         COUNT(DISTINCT o.id) as total_objectives,
         AVG(CAST(o.progress AS FLOAT)) as avg_objective_progress,
         COUNT(DISTINCT kr.id) as total_key_results,
         AVG(CAST(kr.progress AS FLOAT)) as avg_key_result_progress
       FROM users u
       INNER JOIN roles r ON u.role_id = r.id
       LEFT JOIN objectives o ON o.owner_id = u.id AND o.deleted_at IS NULL ${periodFilter}
       LEFT JOIN key_results kr ON kr.owner_id = u.id AND kr.deleted_at IS NULL
       WHERE u.deleted_at IS NULL AND u.is_active = 1
       GROUP BY u.id, u.first_name, u.last_name, u.email, r.display_name
       ORDER BY avg_objective_progress DESC`,
      params,
    );

    return result.recordset.map((r) => ({
      userId: r.user_id,
      userName: r.user_name,
      email: r.email,
      role: r.role,
      totalObjectives: r.total_objectives,
      avgObjectiveProgress: r.avg_objective_progress ? Math.round(r.avg_objective_progress * 100) / 100 : 0,
      totalKeyResults: r.total_key_results,
      avgKeyResultProgress: r.avg_key_result_progress ? Math.round(r.avg_key_result_progress * 100) / 100 : 0,
    }));
  }
}
