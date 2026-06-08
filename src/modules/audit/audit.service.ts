import { Injectable } from '@nestjs/common';
import * as sql from 'mssql';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class AuditService {
  constructor(private db: DatabaseService) {}

  async log(data: {
    userId?: string;
    action: string;
    entityType: string;
    entityId?: string;
    oldValues?: any;
    newValues?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    await this.db.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent)
       VALUES (@userId, @action, @entityType, @entityId, @oldValues, @newValues, @ipAddress, @userAgent)`,
      {
        userId: { type: sql.UniqueIdentifier, value: data.userId || null },
        action: { type: sql.NVarChar, value: data.action },
        entityType: { type: sql.NVarChar, value: data.entityType },
        entityId: { type: sql.NVarChar, value: data.entityId || null },
        oldValues: { type: sql.NVarChar, value: data.oldValues ? JSON.stringify(data.oldValues) : null },
        newValues: { type: sql.NVarChar, value: data.newValues ? JSON.stringify(data.newValues) : null },
        ipAddress: { type: sql.NVarChar, value: data.ipAddress || null },
        userAgent: { type: sql.NVarChar, value: data.userAgent || null },
      },
    );
  }

  async findAll(page = 1, limit = 50, entityType?: string) {
    const offset = (page - 1) * limit;
    let where = '1=1';
    const params: Record<string, any> = {
      offset: { type: sql.Int, value: offset },
      limit: { type: sql.Int, value: limit },
    };

    if (entityType) {
      where += ' AND al.entity_type = @entityType';
      params.entityType = { type: sql.NVarChar, value: entityType };
    }

    const result = await this.db.query<any>(
      `SELECT al.id, al.action, al.entity_type, al.entity_id,
              al.old_values, al.new_values, al.ip_address, al.created_at,
              al.user_id, u.email as user_email,
              u.first_name + ' ' + u.last_name as user_name
       FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.id
       WHERE ${where}
       ORDER BY al.created_at DESC
       OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`,
      params,
    );

    return result.recordset.map((a) => ({
      id: a.id,
      action: a.action,
      entityType: a.entity_type,
      entityId: a.entity_id,
      oldValues: a.old_values ? JSON.parse(a.old_values) : null,
      newValues: a.new_values ? JSON.parse(a.new_values) : null,
      ipAddress: a.ip_address,
      userId: a.user_id,
      userEmail: a.user_email,
      userName: a.user_name,
      createdAt: a.created_at,
    }));
  }
}
