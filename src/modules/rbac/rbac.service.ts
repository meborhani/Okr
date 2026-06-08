import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import * as sql from 'mssql';

@Injectable()
export class RbacService {
  constructor(private db: DatabaseService) {}

  async getUserPermissions(userId: string): Promise<string[]> {
    const result = await this.db.query<{ name: string }>(
      `SELECT DISTINCT p.name
       FROM permissions p
       INNER JOIN role_permissions rp ON p.id = rp.permission_id
       INNER JOIN users u ON u.role_id = rp.role_id
       WHERE u.id = @userId AND u.deleted_at IS NULL AND u.is_active = 1`,
      { userId: { type: sql.UniqueIdentifier, value: userId } },
    );
    return result.recordset.map((r) => r.name);
  }

  async getRoles() {
    const result = await this.db.query(
      `SELECT id, name, display_name, description, is_active, created_at
       FROM roles WHERE deleted_at IS NULL ORDER BY name`,
    );
    return result.recordset;
  }

  async getPermissions() {
    const result = await this.db.query(
      `SELECT id, name, display_name, module, action, created_at
       FROM permissions ORDER BY module, action`,
    );
    return result.recordset;
  }
}
