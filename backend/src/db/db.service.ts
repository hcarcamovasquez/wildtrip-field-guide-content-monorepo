import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

@Injectable()
export class DbService implements OnModuleInit, OnModuleDestroy {
  private sql: postgres.Sql;
  public db: ReturnType<typeof drizzle>;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const databaseUrl = this.configService.get<string>('database.url');
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not defined');
    }

    // Create postgres connection
    this.sql = postgres(databaseUrl, {
      max: 10, // Max connections
      idle_timeout: 30,
    });

    // Create drizzle instance
    this.db = drizzle(this.sql, { schema });
    
    console.log('Database connection established');
  }

  async onModuleDestroy() {
    if (this.sql) {
      await this.sql.end();
      console.log('Database connection closed');
    }
  }

  getDb() {
    return this.db;
  }
}