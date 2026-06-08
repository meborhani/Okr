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

async function runMigration() {
  const pool = await sql.connect(config);
  try {
    const migrationPath = path.join(__dirname, '..', 'migrations', '0001_init.sql');
    const sql_content = fs.readFileSync(migrationPath, 'utf8');

    // Split by GO statements or run as batches
    const batches = sql_content.split(/\bGO\b/i).map(b => b.trim()).filter(b => b.length > 0);

    if (batches.length <= 1) {
      // No GO separators, split by CREATE TABLE / ALTER TABLE / CREATE INDEX statements
      const statements = splitSqlStatements(sql_content);
      for (const stmt of statements) {
        if (stmt.trim()) {
          try {
            await pool.request().query(stmt);
          } catch (err) {
            if (err.message && (
              err.message.includes('already an object') ||
              err.message.includes('already exists') ||
              err.message.includes('Duplicate')
            )) {
              console.log(`  Skipped (already exists): ${stmt.substring(0, 60).replace(/\n/g, ' ')}...`);
            } else {
              throw err;
            }
          }
        }
      }
    } else {
      for (const batch of batches) {
        try {
          await pool.request().query(batch);
        } catch (err) {
          if (err.message && (
            err.message.includes('already an object') ||
            err.message.includes('already exists')
          )) {
            console.log(`  Skipped (already exists)`);
          } else {
            throw err;
          }
        }
      }
    }

    console.log('Migration 0001_init.sql completed successfully.');
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
    await runMigration();
    console.log('Database initialization completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Database initialization failed:', err.message);
    process.exit(1);
  }
}

main();
