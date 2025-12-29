import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

config({ quiet: true });

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: Number(process.env.POSTGRES_PORT) || 5432,
  username: process.env.POSTGRES_USER || 'rag',
  password: process.env.POSTGRES_PASSWORD || 'rag_password_change_me',
  database: process.env.POSTGRES_DB || 'rag',
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/database/migrations/*.js'],
  migrationsTableName: 'migrations',
  logging: process.env.DB_LOGGING === 'true',
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
