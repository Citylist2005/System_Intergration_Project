import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendance } from '../../database/payroll/entities/attendance.entity';
import { EmployeesPayroll } from '../../database/payroll/entities/employees-payroll.entity';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [Attendance, EmployeesPayroll],
      'payrollConnection',
    ),
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
