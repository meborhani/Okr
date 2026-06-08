'use strict';

const sql = require('mssql');
const fs = require('fs');
const path = require('path');
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

async function createDatabaseIfNotExists() {
  const masterConfig = { ...config, database: 'master' };
  const pool = await sql.connect(masterConfig);
  try {
    const dbName = process.env.DB_NAME || 'okr_db';
    const result = await pool.request()
      .input('dbName', sql.NVarChar, dbName)
      .query("SELECT name FROM sys.databases WHERE name = @dbName");
    if (result.recordset.length === 0) {
      await pool.request().query(`CREATE DATABASE [${dbName}]`);
      console.log(`Database '${dbName}' created.`);
    } else {
      console.log(`Database '${dbName}' already exists.`);
    }
  } finally {
    await pool.close();
  }
}

async function runMigrations() {
  const pool = await sql.connect(config);
  try {
    const migrationsDir = path.join(__dirname, '..', 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      console.log(`Running migration: ${file}`);
      const sql_content = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      const statements = splitSqlStatements(sql_content);
      for (const stmt of statements) {
        if (stmt.trim()) {
          try {
            await pool.request().query(stmt);
          } catch (err) {
            if (err.message && (
              err.message.includes('already an object') ||
              err.message.includes('already exists') ||
              err.message.includes('Duplicate key') ||
              err.message.includes('Column already exists') ||
              err.message.includes('Invalid column name') ||
              err.message.includes('Could not create constraint') ||
              err.message.includes('Column names in each table must be unique')
            )) {
              console.log(`  Skipped (already applied): ${stmt.substring(0, 60).replace(/\n/g, ' ')}...`);
            } else {
              throw err;
            }
          }
        }
      }
      console.log(`  ${file} completed.`);
    }
  } finally {
    await pool.close();
  }
}

function splitSqlStatements(sql_content) {
  const lines = sql_content.split('\n');
  const statements = [];
  let current = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('--')) continue;
    current.push(line);
    if (trimmed.endsWith(';')) {
      statements.push(current.join('\n'));
      current = [];
    }
  }
  if (current.join('').trim()) {
    statements.push(current.join('\n'));
  }
  return statements;
}

async function main() {
  console.log('Starting database initialization...');
  try {
    await createDatabaseIfNotExists();
    await runMigrations();
    console.log('Database initialization completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Database initialization failed:', err.message);
    process.exit(1);
  }
}

main();
