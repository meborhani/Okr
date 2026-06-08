import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import * as sql from 'mssql';
import { DatabaseService } from '../../database/database.service';

export interface CreateTaskDto {
  title: string;
  description?: string;
  priority?: 'normal' | 'important' | 'urgent';
  assigneeId: string;
  minutesId?: string;
  sessionId?: string;
  sourceType?: string;
  dueDate?: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  priority?: 'normal' | 'important' | 'urgent';
  status?: 'assigned' | 'in_progress' | 'done' | 'archived';
  assigneeId?: string;
  dueDate?: string | null;
}

@Injectable()
export class TasksService {
  constructor(private db: DatabaseService) {}

  async findAll(userId: string, isAdmin: boolean) {
    const where = isAdmin ? 'WHERE t.deleted_at IS NULL' : 'WHERE t.deleted_at IS NULL AND t.assignee_id = @userId';
    const params: Record<string, any> = isAdmin ? {} : { userId: { type: sql.UniqueIdentifier, value: userId } };

    const result = await this.db.query<any>(
      `SELECT t.id, t.title, t.description, t.status, t.priority, t.due_date, t.position,
              t.created_at, t.updated_at, t.minutes_id, t.session_id, t.source_type,
              t.assignee_id, a.first_name + ' ' + a.last_name as assignee_name,
              ad.name as assignee_department, ad.id as assignee_department_id,
              t.created_by, cb.first_name + ' ' + cb.last_name as creator_name,
              (SELECT COUNT(*) FROM task_comments c WHERE c.task_id = t.id AND c.deleted_at IS NULL) as comment_count,
              COALESCE(csm.title, csd.title) as source_session_title,
              op.title as source_period_title, op.year as source_period_year, op.quarter as source_period_quarter
       FROM tasks t
       INNER JOIN users a ON t.assignee_id = a.id
       LEFT JOIN departments ad ON a.department_id = ad.id AND ad.deleted_at IS NULL
       INNER JOIN users cb ON t.created_by = cb.id
       LEFT JOIN session_minutes sm ON t.minutes_id = sm.id
       LEFT JOIN check_in_sessions csm ON sm.session_id = csm.id
       LEFT JOIN check_in_sessions csd ON t.session_id = csd.id
       LEFT JOIN okr_periods op ON COALESCE(csm.period_id, csd.period_id) = op.id
       ${where}
       ORDER BY t.position ASC, t.created_at DESC`,
      params,
    );

    const tasks = result.recordset.map(this.mapTask);
    // Attach tags
    if (tasks.length > 0) {
      const ids = tasks.map((t) => `'${t.id}'`).join(',');
      const tagResult = await this.db.query<any>(
        `SELECT id, task_id, label, color FROM task_tags WHERE task_id IN (${ids})`,
      );
      const tagsByTask: Record<string, any[]> = {};
      for (const tag of tagResult.recordset) {
        if (!tagsByTask[tag.task_id]) tagsByTask[tag.task_id] = [];
        tagsByTask[tag.task_id].push({ id: tag.id, label: tag.label, color: tag.color });
      }
      for (const task of tasks) {
        task.tags = tagsByTask[task.id] || [];
      }
    }
    return tasks;
  }

  async findById(id: string) {
    const result = await this.db.query<any>(
      `SELECT t.id, t.title, t.description, t.status, t.priority, t.due_date, t.position,
              t.created_at, t.updated_at, t.minutes_id,
              t.assignee_id, a.first_name + ' ' + a.last_name as assignee_name,
              ad.name as assignee_department, ad.id as assignee_department_id,
              t.created_by, cb.first_name + ' ' + cb.last_name as creator_name,
              (SELECT COUNT(*) FROM task_comments c WHERE c.task_id = t.id AND c.deleted_at IS NULL) as comment_count
       FROM tasks t
       INNER JOIN users a ON t.assignee_id = a.id
       LEFT JOIN departments ad ON a.department_id = ad.id AND ad.deleted_at IS NULL
       INNER JOIN users cb ON t.created_by = cb.id
       WHERE t.id = @id AND t.deleted_at IS NULL`,
      { id: { type: sql.UniqueIdentifier, value: id } },
    );
    if (!result.recordset.length) throw new NotFoundException('تسک یافت نشد');

    const task = this.mapTask(result.recordset[0]);
    const tagResult = await this.db.query<any>(
      `SELECT id, label, color FROM task_tags WHERE task_id = @id`,
      { id: { type: sql.UniqueIdentifier, value: id } },
    );
    task.tags = tagResult.recordset.map((r) => ({ id: r.id, label: r.label, color: r.color }));
    return task;
  }

  async create(dto: CreateTaskDto, userId: string) {
    const posResult = await this.db.query<any>(
      `SELECT ISNULL(MAX(position), -1) + 1 as next_pos FROM tasks WHERE status = 'assigned' AND deleted_at IS NULL`,
    );
    const position = posResult.recordset[0].next_pos;

    const result = await this.db.query<any>(
      `INSERT INTO tasks (title, description, priority, assignee_id, created_by, minutes_id, session_id, source_type, due_date, position)
       OUTPUT INSERTED.id
       VALUES (@title, @description, @priority, @assigneeId, @createdBy, @minutesId, @sessionId, @sourceType, @dueDate, @position)`,
      {
        title: { type: sql.NVarChar, value: dto.title },
        description: { type: sql.NVarChar, value: dto.description || null },
        priority: { type: sql.NVarChar, value: dto.priority || 'normal' },
        assigneeId: { type: sql.UniqueIdentifier, value: dto.assigneeId },
        createdBy: { type: sql.UniqueIdentifier, value: userId },
        minutesId: { type: sql.UniqueIdentifier, value: dto.minutesId || null },
        sessionId: { type: sql.UniqueIdentifier, value: dto.sessionId || null },
        sourceType: { type: sql.NVarChar, value: dto.sourceType || null },
        dueDate: { type: sql.DateTime2, value: dto.dueDate ? new Date(dto.dueDate) : null },
        position: { type: sql.Int, value: position },
      },
    );
    return this.findById(result.recordset[0].id);
  }

  async update(id: string, dto: UpdateTaskDto, userId: string, isAdmin: boolean) {
    const task = await this.findById(id);
    if (!isAdmin && String(task.assigneeId) !== String(userId)) {
      throw new ForbiddenException('شما مجاز به ویرایش این تسک نیستید');
    }

    const sets: string[] = ['updated_at = GETUTCDATE()'];
    const params: Record<string, any> = { id: { type: sql.UniqueIdentifier, value: id } };

    if (dto.title !== undefined) { sets.push('title = @title'); params.title = { type: sql.NVarChar, value: dto.title }; }
    if (dto.description !== undefined) { sets.push('description = @description'); params.description = { type: sql.NVarChar, value: dto.description }; }
    if (dto.priority !== undefined) { sets.push('priority = @priority'); params.priority = { type: sql.NVarChar, value: dto.priority }; }
    if (dto.status !== undefined) { sets.push('status = @status'); params.status = { type: sql.NVarChar, value: dto.status }; }
    if (dto.assigneeId !== undefined && isAdmin) { sets.push('assignee_id = @assigneeId'); params.assigneeId = { type: sql.UniqueIdentifier, value: dto.assigneeId }; }
    if (dto.dueDate !== undefined) {
      sets.push('due_date = @dueDate');
      params.dueDate = { type: sql.DateTime2, value: dto.dueDate ? new Date(dto.dueDate) : null };
    }

    await this.db.query(`UPDATE tasks SET ${sets.join(', ')} WHERE id = @id`, params);
    return this.findById(id);
  }

  async remove(id: string) {
    await this.findById(id);
    await this.db.query(
      `UPDATE tasks SET deleted_at = GETUTCDATE() WHERE id = @id`,
      { id: { type: sql.UniqueIdentifier, value: id } },
    );
  }

  async addTag(taskId: string, label: string, color: string) {
    await this.db.query(
      `INSERT INTO task_tags (task_id, label, color) VALUES (@taskId, @label, @color)`,
      {
        taskId: { type: sql.UniqueIdentifier, value: taskId },
        label: { type: sql.NVarChar, value: label },
        color: { type: sql.NVarChar, value: color },
      },
    );
    return this.findById(taskId);
  }

  async removeTag(taskId: string, tagId: string) {
    await this.db.query(
      `DELETE FROM task_tags WHERE id = @tagId AND task_id = @taskId`,
      {
        tagId: { type: sql.UniqueIdentifier, value: tagId },
        taskId: { type: sql.UniqueIdentifier, value: taskId },
      },
    );
  }

  async getComments(taskId: string) {
    const result = await this.db.query<any>(
      `SELECT c.id, c.content, c.created_at, c.updated_at,
              c.author_id, u.first_name + ' ' + u.last_name as author_name
       FROM task_comments c
       INNER JOIN users u ON c.author_id = u.id
       WHERE c.task_id = @taskId AND c.deleted_at IS NULL
       ORDER BY c.created_at ASC`,
      { taskId: { type: sql.UniqueIdentifier, value: taskId } },
    );
    return result.recordset.map((c) => ({
      id: c.id,
      content: c.content,
      authorId: c.author_id,
      authorName: c.author_name,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    }));
  }

  async addComment(taskId: string, content: string, userId: string) {
    await this.db.query(
      `INSERT INTO task_comments (task_id, author_id, content) VALUES (@taskId, @authorId, @content)`,
      {
        taskId: { type: sql.UniqueIdentifier, value: taskId },
        authorId: { type: sql.UniqueIdentifier, value: userId },
        content: { type: sql.NVarChar, value: content },
      },
    );
    return this.getComments(taskId);
  }

  async deleteComment(taskId: string, commentId: string, userId: string, isAdmin: boolean) {
    const result = await this.db.query<any>(
      `SELECT author_id FROM task_comments WHERE id = @id AND task_id = @taskId AND deleted_at IS NULL`,
      {
        id: { type: sql.UniqueIdentifier, value: commentId },
        taskId: { type: sql.UniqueIdentifier, value: taskId },
      },
    );
    if (!result.recordset.length) throw new NotFoundException('کامنت یافت نشد');
    if (!isAdmin && String(result.recordset[0].author_id) !== String(userId)) {
      throw new ForbiddenException('شما مجاز به حذف این کامنت نیستید');
    }
    await this.db.query(
      `UPDATE task_comments SET deleted_at = GETUTCDATE() WHERE id = @id`,
      { id: { type: sql.UniqueIdentifier, value: commentId } },
    );
  }

  private mapTask(t: any) {
    return {
      id: t.id,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      dueDate: t.due_date,
      position: t.position,
      minutesId: t.minutes_id,
      sessionId: t.session_id,
      sourceType: t.source_type || (t.minutes_id || t.session_id ? 'meeting_minutes' : null),
      sourceSessionTitle: t.source_session_title,
      sourcePeriodTitle: t.source_period_title,
      sourcePeriodYear: t.source_period_year,
      sourcePeriodQuarter: t.source_period_quarter,
      assigneeId: t.assignee_id,
      assigneeName: t.assignee_name,
      assigneeDepartment: t.assignee_department,
      assigneeDepartmentId: t.assignee_department_id,
      createdBy: t.created_by,
      creatorName: t.creator_name,
      commentCount: Number(t.comment_count),
      createdAt: t.created_at,
      updatedAt: t.updated_at,
      tags: [] as { id: string; label: string; color: string }[],
    };
  }
}
