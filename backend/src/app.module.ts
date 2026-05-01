import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getHumanDbConfig, getPayrollDbConfig } from './config/database.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmployeesModule } from './modules/employees/employees.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { PayrollModule } from './modules/payroll/payroll.module';
import { SyncModule } from './modules/sync/sync.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    // Global config
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // SQL Server - HUMAN_2025 (source)
    TypeOrmModule.forRootAsync({
      name: 'humanConnection',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        getHumanDbConfig(configService),
    }),

    // MySQL - PAYROLL_2026 (target)
    TypeOrmModule.forRootAsync({
      name: 'payrollConnection',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        getPayrollDbConfig(configService),
    }),

    // Feature modules
    AuthModule,
    EmployeesModule,
    AttendanceModule,
    PayrollModule,
    SyncModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
