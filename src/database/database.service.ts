import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sql from 'mssql';

type SqlParam = {
  type: sql.ISqlType | (() => sql.ISqlType);
  value: unknown;
};

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool!: sql.ConnectionPool;
  private readonly logger = new Logger(DatabaseService.name);

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    await this.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.disconnect();
  }

  private readPort(): number {
    const rawPort =
      this.configService.get<string>('DB_PORT') ??
      process.env.DB_PORT ??
      '1433';

    const cleanedPort = String(rawPort).trim().replace(/"/g, '').replace(/'/g, '');
    const port = Number(cleanedPort);

    if (!Number.isInteger(port) || port <= 0) {
      throw new Error(`DB_PORT must be a valid number. Current value: ${rawPort}`);
    }

    return port;
  }

  private readBoolean(key: string, defaultValue: boolean): boolean {
    const rawValue = this.configService.get<string>(key) ?? process.env[key];

    if (rawValue === undefined || rawValue === null || rawValue === '') {
      return defaultValue;
    }

    const normalized = String(rawValue).trim().toLowerCase();

    if (normalized === 'true') return true;
    if (normalized === 'false') return false;

    return defaultValue;
  }

  private async connect(): Promise<void> {
    const port = this.readPort();

    // const config: sql.config = {
    //   server: this.configService.get<string>('DB_SERVER') || process.env.DB_SERVER || '192.168.0.26',
    //   port,
    //   database: this.configService.get<string>('DB_NAME') || process.env.DB_NAME || 'OKR_DB',
    //   user: this.configService.get<string>('DB_USER') || process.env.DB_USER || 'sa',
    //   password: this.configService.get<string>('DB_PASSWORD') || process.env.DB_PASSWORD || 'sa123',
    //   options: {
    //     encrypt: this.readBoolean('DB_ENCRYPT', false),
    //     trustServerCertificate: this.readBoolean('DB_TRUST_SERVER_CERTIFICATE', true),
    //     enableArithAbort: true,
    //   },
    //   pool: {
    //     max: 10,
    //     min: 0,
    //     idleTimeoutMillis: 30000,
    //   },
    // };

    const config: sql.config = {
  server: '192.168.0.26',
  port: 1433,
  database: 'OKR_DB',
  user: 'sa',
  password: 'sa123',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

console.log('SQL CONFIG PORT:', config.port, typeof config.port);

    this.logger.log(
      `Connecting to SQL Server ${config.server}:${config.port}/${config.database}`,
    );

    this.pool = new sql.ConnectionPool(config);
    await this.pool.connect();

    this.logger.log('Database connected successfully');
  }

  private async disconnect(): Promise<void> {
    if (this.pool?.connected) {
      await this.pool.close();
      this.logger.log('Database connection closed');
    }
  }

  getPool(): sql.ConnectionPool {
    return this.pool;
  }

  request(): sql.Request {
    return this.pool.request();
  }

  async query<T = any>(
    queryString: string,
    params?: Record<string, SqlParam>,
  ): Promise<sql.IResult<T>> {
    const req = this.pool.request();

    if (params) {
      for (const [key, param] of Object.entries(params)) {
        req.input(key, param.type, param.value);
      }
    }

    return req.query<T>(queryString);
  }

  get types() {
    return sql;
  }
}