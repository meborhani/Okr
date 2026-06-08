'use strict';

const sql = require('mssql');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const config = {
  server: process.env.DB_SERVER || 'localhost',
  port: parseInt(process.env.DB_PORT || '1433'),
  database: process.env.DB_NAME || 'okr_db',
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '',
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== 'false',
    enableArithAbort: true,
  },
};

const roles = [
  { name: 'super_admin', display_name: 'Super Admin', description: 'دسترسی کامل به سیستم' },
  { name: 'admin', display_name: 'Admin', description: 'مدیر سیستم' },
  { name: 'ceo', display_name: 'CEO', description: 'مدیر عامل' },
  { name: 'department_manager', display_name: 'Department Manager', description: 'مدیر دپارتمان' },
  { name: 'team_manager', display_name: 'Team Manager', description: 'مدیر تیم' },
  { name: 'employee', display_name: 'Employee', description: 'کارمند' },
];

const permissions = [
  // Users
  { name: 'users:read', display_name: 'مشاهده کاربران', module: 'users', action: 'read' },
  { name: 'users:create', display_name: 'ایجاد کاربر', module: 'users', action: 'create' },
  { name: 'users:update', display_name: 'ویرایش کاربر', module: 'users', action: 'update' },
  { name: 'users:delete', display_name: 'حذف کاربر', module: 'users', action: 'delete' },
  // Departments
  { name: 'departments:read', display_name: 'مشاهده دپارتمان‌ها', module: 'departments', action: 'read' },
  { name: 'departments:create', display_name: 'ایجاد دپارتمان', module: 'departments', action: 'create' },
  { name: 'departments:update', display_name: 'ویرایش دپارتمان', module: 'departments', action: 'update' },
  { name: 'departments:delete', display_name: 'حذف دپارتمان', module: 'departments', action: 'delete' },
  // Teams
  { name: 'teams:read', display_name: 'مشاهده تیم‌ها', module: 'teams', action: 'read' },
  { name: 'teams:create', display_name: 'ایجاد تیم', module: 'teams', action: 'create' },
  { name: 'teams:update', display_name: 'ویرایش تیم', module: 'teams', action: 'update' },
  { name: 'teams:delete', display_name: 'حذف تیم', module: 'teams', action: 'delete' },
  // OKR Periods
  { name: 'okr_periods:read', display_name: 'مشاهده دوره‌های OKR', module: 'okr_periods', action: 'read' },
  { name: 'okr_periods:create', display_name: 'ایجاد دوره OKR', module: 'okr_periods', action: 'create' },
  { name: 'okr_periods:update', display_name: 'ویرایش دوره OKR', module: 'okr_periods', action: 'update' },
  { name: 'okr_periods:manage', display_name: 'مدیریت وضعیت دوره OKR', module: 'okr_periods', action: 'manage' },
  // Objectives
  { name: 'objectives:read', display_name: 'مشاهده اهداف', module: 'objectives', action: 'read' },
  { name: 'objectives:create', display_name: 'ایجاد هدف', module: 'objectives', action: 'create' },
  { name: 'objectives:update', display_name: 'ویرایش هدف', module: 'objectives', action: 'update' },
  { name: 'objectives:delete', display_name: 'حذف هدف', module: 'objectives', action: 'delete' },
  // Key Results
  { name: 'key_results:read', display_name: 'مشاهده نتایج کلیدی', module: 'key_results', action: 'read' },
  { name: 'key_results:create', display_name: 'ایجاد نتیجه کلیدی', module: 'key_results', action: 'create' },
  { name: 'key_results:update', display_name: 'ویرایش نتیجه کلیدی', module: 'key_results', action: 'update' },
  { name: 'key_results:delete', display_name: 'حذف نتیجه کلیدی', module: 'key_results', action: 'delete' },
  // Check-ins
  { name: 'check_ins:read', display_name: 'مشاهده چک‌این‌ها', module: 'check_ins', action: 'read' },
  { name: 'check_ins:create', display_name: 'ایجاد چک‌این', module: 'check_ins', action: 'create' },
  // Reports
  { name: 'reports:read', display_name: 'مشاهده گزارش‌ها', module: 'reports', action: 'read' },
  // Audit
  { name: 'audit:read', display_name: 'مشاهده لاگ‌ها', module: 'audit', action: 'read' },
];

async function seedRoles(pool) {
  console.log('Seeding roles...');
  const roleIds = {};
  for (const role of roles) {
    const existing = await pool.request()
      .input('name', sql.NVarChar, role.name)
      .query('SELECT id FROM roles WHERE name = @name');

    if (existing.recordset.length === 0) {
      const result = await pool.request()
        .input('name', sql.NVarChar, role.name)
        .input('display_name', sql.NVarChar, role.display_name)
        .input('description', sql.NVarChar, role.description)
        .query('INSERT INTO roles (name, display_name, description) OUTPUT INSERTED.id VALUES (@name, @display_name, @description)');
      roleIds[role.name] = result.recordset[0].id;
      console.log(`  Created role: ${role.name}`);
    } else {
      roleIds[role.name] = existing.recordset[0].id;
      console.log(`  Role exists: ${role.name}`);
    }
  }
  return roleIds;
}

async function seedPermissions(pool) {
  console.log('Seeding permissions...');
  const permIds = {};
  for (const perm of permissions) {
    const existing = await pool.request()
      .input('name', sql.NVarChar, perm.name)
      .query('SELECT id FROM permissions WHERE name = @name');

    if (existing.recordset.length === 0) {
      const result = await pool.request()
        .input('name', sql.NVarChar, perm.name)
        .input('display_name', sql.NVarChar, perm.display_name)
        .input('module', sql.NVarChar, perm.module)
        .input('action', sql.NVarChar, perm.action)
        .query('INSERT INTO permissions (name, display_name, module, action) OUTPUT INSERTED.id VALUES (@name, @display_name, @module, @action)');
      permIds[perm.name] = result.recordset[0].id;
    } else {
      permIds[perm.name] = existing.recordset[0].id;
    }
  }
  console.log(`  ${permissions.length} permissions seeded.`);
  return permIds;
}

async function seedRolePermissions(pool, roleIds, permIds) {
  console.log('Seeding role permissions...');

  const allPerms = Object.keys(permIds);

  // super_admin and admin get all permissions
  for (const roleName of ['super_admin', 'admin']) {
    const roleId = roleIds[roleName];
    for (const permName of allPerms) {
      const permId = permIds[permName];
      const existing = await pool.request()
        .input('role_id', sql.UniqueIdentifier, roleId)
        .input('permission_id', sql.UniqueIdentifier, permId)
        .query('SELECT id FROM role_permissions WHERE role_id = @role_id AND permission_id = @permission_id');
      if (existing.recordset.length === 0) {
        await pool.request()
          .input('role_id', sql.UniqueIdentifier, roleId)
          .input('permission_id', sql.UniqueIdentifier, permId)
          .query('INSERT INTO role_permissions (role_id, permission_id) VALUES (@role_id, @permission_id)');
      }
    }
  }

  // ceo gets read and objectives/key_results permissions
  const ceoPerms = allPerms.filter(p =>
    p.endsWith(':read') || p.startsWith('objectives:') || p.startsWith('key_results:') || p.startsWith('check_ins:')
  );
  for (const permName of ceoPerms) {
    const permId = permIds[permName];
    const roleId = roleIds['ceo'];
    const existing = await pool.request()
      .input('role_id', sql.UniqueIdentifier, roleId)
      .input('permission_id', sql.UniqueIdentifier, permId)
      .query('SELECT id FROM role_permissions WHERE role_id = @role_id AND permission_id = @permission_id');
    if (existing.recordset.length === 0) {
      await pool.request()
        .input('role_id', sql.UniqueIdentifier, roleId)
        .input('permission_id', sql.UniqueIdentifier, permId)
        .query('INSERT INTO role_permissions (role_id, permission_id) VALUES (@role_id, @permission_id)');
    }
  }

  // department_manager and team_manager
  const managerPerms = allPerms.filter(p =>
    p.endsWith(':read') ||
    p.startsWith('objectives:') ||
    p.startsWith('key_results:') ||
    p.startsWith('check_ins:')
  );
  for (const roleName of ['department_manager', 'team_manager']) {
    const roleId = roleIds[roleName];
    for (const permName of managerPerms) {
      const permId = permIds[permName];
      const existing = await pool.request()
        .input('role_id', sql.UniqueIdentifier, roleId)
        .input('permission_id', sql.UniqueIdentifier, permId)
        .query('SELECT id FROM role_permissions WHERE role_id = @role_id AND permission_id = @permission_id');
      if (existing.recordset.length === 0) {
        await pool.request()
          .input('role_id', sql.UniqueIdentifier, roleId)
          .input('permission_id', sql.UniqueIdentifier, permId)
          .query('INSERT INTO role_permissions (role_id, permission_id) VALUES (@role_id, @permission_id)');
      }
    }
  }

  // employee gets read and check_in:create, objectives/key_results read
  const employeePerms = [
    'objectives:read', 'key_results:read', 'check_ins:read', 'check_ins:create',
    'departments:read', 'teams:read', 'okr_periods:read', 'reports:read'
  ];
  const roleId = roleIds['employee'];
  for (const permName of employeePerms) {
    if (!permIds[permName]) continue;
    const permId = permIds[permName];
    const existing = await pool.request()
      .input('role_id', sql.UniqueIdentifier, roleId)
      .input('permission_id', sql.UniqueIdentifier, permId)
      .query('SELECT id FROM role_permissions WHERE role_id = @role_id AND permission_id = @permission_id');
    if (existing.recordset.length === 0) {
      await pool.request()
        .input('role_id', sql.UniqueIdentifier, roleId)
        .input('permission_id', sql.UniqueIdentifier, permId)
        .query('INSERT INTO role_permissions (role_id, permission_id) VALUES (@role_id, @permission_id)');
    }
  }

  console.log('  Role permissions seeded.');
}

async function seedAdminUser(pool, roleIds) {
  console.log('Seeding admin user...');
  const email = 'admin@company.com';
  const existing = await pool.request()
    .input('email', sql.NVarChar, email)
    .query('SELECT id FROM users WHERE email = @email');

  if (existing.recordset.length === 0) {
    const passwordHash = await bcrypt.hash('Admin@12345', 12);
    await pool.request()
      .input('email', sql.NVarChar, email)
      .input('password_hash', sql.NVarChar, passwordHash)
      .input('first_name', sql.NVarChar, 'Admin')
      .input('last_name', sql.NVarChar, 'System')
      .input('role_id', sql.UniqueIdentifier, roleIds['super_admin'])
      .query(`INSERT INTO users (email, password_hash, first_name, last_name, role_id)
              VALUES (@email, @password_hash, @first_name, @last_name, @role_id)`);
    console.log('  Admin user created: admin@company.com / Admin@12345');
  } else {
    console.log('  Admin user already exists.');
  }
}

async function main() {
  console.log('Starting seed...');
  let pool;
  try {
    pool = await sql.connect(config);
    const roleIds = await seedRoles(pool);
    const permIds = await seedPermissions(pool);
    await seedRolePermissions(pool, roleIds, permIds);
    await seedAdminUser(pool, roleIds);
    console.log('\nSeed completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  } finally {
    if (pool) await pool.close();
  }
}

main();
