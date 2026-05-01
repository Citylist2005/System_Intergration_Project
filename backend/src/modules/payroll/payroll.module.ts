import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Salary } from '../../database/payroll/entities/salaries.entity';
import { EmployeesPayroll } from '../../database/payroll/entities/employees-payroll.entity';
import { Attendance } from '../../database/payroll/entities/attendance.entity';
import { PayrollController } from './payroll.controller';
import { PayrollService } from './payroll.service';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [Salary, EmployeesPayroll, Attendance],
      'payrollConnection',
    ),
  ],
  controllers: [PayrollController],
  providers: [PayrollService],
  exports: [PayrollService],
})
export class PayrollModule {}
