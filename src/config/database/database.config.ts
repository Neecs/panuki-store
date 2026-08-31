import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const isProduction: boolean =
    configService.get<string>('IS_PRODUCTION') === 'true';

  return {
    type: 'postgres',
    host: configService.get<string>('DB_HOST'),
    port: Number(configService.get<string>('DB_PORT')),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_NAME'),
    autoLoadEntities: true,
    synchronize: !isProduction,
    migrationsRun: isProduction,
    migrations: isProduction
      ? ['dist/migrations/*.js']
      : ['src/migrations/*.ts'],
  };
};
