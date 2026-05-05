import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendance } from '../../database/payroll/entities/attendance.entity';
import { EmployeesPayroll } from '../../database/payroll/entities/employees-payroll.entity';
import { HumanAttendance } from '../../database/human/entities/attendance.entity';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    AuditModule,
    TypeOrmModule.forFeature(
      [Attendance, EmployeesPayroll],
      'payrollConnection',
    ),
    TypeOrmModule.forFeature([HumanAttendance], 'humanConnection'),
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
