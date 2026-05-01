import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeesPayroll } from '../../database/payroll/entities/employees-payroll.entity';
import { PayrollDepartment } from '../../database/payroll/entities/departments-payroll.entity';
import { PayrollPosition } from '../../database/payroll/entities/positions-payroll.entity';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [EmployeesPayroll, PayrollDepartment, PayrollPosition],
      'payrollConnection',
    ),
  ],
  controllers: [EmployeesController],
  providers: [EmployeesService],
  exports: [EmployeesService],
})
export class EmployeesModule {}
