import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alert } from '../../database/payroll/entities/alert.entity';
import { Attendance } from '../../database/payroll/entities/attendance.entity';
import { EmployeesPayroll } from '../../database/payroll/entities/employees-payroll.entity';
import { Salary } from '../../database/payroll/entities/salaries.entity';
import { AlertsController } from './alerts.controller';
import { AlertsCronService } from './alerts.cron';
import { AlertsService } from './alerts.service';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [Alert, Attendance, EmployeesPayroll, Salary],
      'payrollConnection',
    ),
  ],
  controllers: [AlertsController],
  providers: [AlertsService, AlertsCronService],
})
export class AlertsModule {}
