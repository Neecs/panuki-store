import { DataSource } from 'typeorm';

process.loadEnvFile();

const isProduction = process.env.IS_PRODUCTION === 'true';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true',

  entities: isProduction ? ['dist/**/*.entity.js'] : ['src/**/*.entity.ts'],

  migrations: isProduction
    ? ['dist/database/migrations/*.js']
    : ['src/database/migrations/*.ts'],
});
