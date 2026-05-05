import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendance } from '../../database/payroll/entities/attendance.entity';
import { AuditLog } from '../../database/payroll/entities/audit-log.entity';
import { EmployeesPayroll } from '../../database/payroll/entities/employees-payroll.entity';
import { Salary } from '../../database/payroll/entities/salaries.entity';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [Attendance, AuditLog, EmployeesPayroll, Salary],
      'payrollConnection',
    ),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
