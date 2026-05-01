import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

const getNumber = (
  configService: ConfigService,
  key: string,
  fallback: number,
): number => {
  const value = configService.get<string>(key);
  const parsedValue = value ? Number.parseInt(value, 10) : fallback;

  return Number.isNaN(parsedValue) ? fallback : parsedValue;
};

export const getHumanDbConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  name: 'humanConnection',
  manualInitialization: true,
  type: 'mssql',
  host: configService.get<string>('HUMAN_DB_HOST', 'localhost'),
  port: getNumber(configService, 'HUMAN_DB_PORT', 1433),
  username: configService.get<string>('HUMAN_DB_USER', 'sa'),
  password: configService.get<string>('HUMAN_DB_PASS', ''),
  database: configService.get<string>('HUMAN_DB_NAME', 'HUMAN_2025'),
  entities: [__dirname + '/../database/human/entities/*.entity{.ts,.js}'],
  synchronize: false,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
  extra: {
    user: configService.get<string>('HUMAN_DB_USER', 'sa'),
    password: configService.get<string>('HUMAN_DB_PASS', ''),
    trustServerCertificate: true,
    options: {
      encrypt: false,
      trustServerCertificate: true,
      enableArithAbort: true,
    },
    authentication: {
      type: 'default',
      options: {
        userName: configService.get<string>('HUMAN_DB_USER', 'sa'),
        password: configService.get<string>('HUMAN_DB_PASS', ''),
      },
    },
  },
});

export const getPayrollDbConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  name: 'payrollConnection',
  manualInitialization: true,
  type: 'mysql',
  host: configService.get<string>('PAYROLL_DB_HOST', 'localhost'),
  port: getNumber(configService, 'PAYROLL_DB_PORT', 3306),
  username: configService.get<string>('PAYROLL_DB_USER', 'root'),
  password: configService.get<string>('PAYROLL_DB_PASS', ''),
  database: configService.get<string>('PAYROLL_DB_NAME', 'payroll_2026'),
  entities: [__dirname + '/../database/payroll/entities/*.entity{.ts,.js}'],
  synchronize: false,
});
