import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Salary } from '../../database/payroll/entities/salaries.entity';
import { EmployeesPayroll } from '../../database/payroll/entities/employees-payroll.entity';
import { Attendance } from '../../database/payroll/entities/attendance.entity';
import { SalaryPolicy } from '../../database/payroll/entities/salary-policy.entity';
import { BenefitsInsurance } from '../../database/payroll/entities/benefits-insurance.entity';
import { PayrollAdjustment } from '../../database/payroll/entities/payroll-adjustment.entity';
import { OvertimeRequest } from '../../database/payroll/entities/overtime-request.entity';
import { PayrollController } from './payroll.controller';
import { PayrollService } from './payroll.service';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [Salary, EmployeesPayroll, Attendance, SalaryPolicy, BenefitsInsurance, PayrollAdjustment, OvertimeRequest],
      'payrollConnection',
    ),
  ],
  controllers: [PayrollController],
  providers: [PayrollService],
  exports: [PayrollService],
})
export class PayrollModule {}
