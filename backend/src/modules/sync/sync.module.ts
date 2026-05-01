import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConnectionsService } from '../../config/database-connections.service';

// HUMAN_2025 (SQL Server) entities
import { HumanEmployee } from '../../database/human/entities/employee.entity';
import { HumanDepartment } from '../../database/human/entities/department.entity';
import { HumanPosition } from '../../database/human/entities/position.entity';

// PAYROLL_2026 (MySQL) entities
import { EmployeesPayroll } from '../../database/payroll/entities/employees-payroll.entity';
import { PayrollDepartment } from '../../database/payroll/entities/departments-payroll.entity';
import { PayrollPosition } from '../../database/payroll/entities/positions-payroll.entity';
import { Attendance } from '../../database/payroll/entities/attendance.entity';

import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';

@Module({
  imports: [
    // Source: SQL Server
    TypeOrmModule.forFeature(
      [HumanEmployee, HumanDepartment, HumanPosition],
      'humanConnection',
    ),
    // Target: MySQL
    TypeOrmModule.forFeature(
      [EmployeesPayroll, PayrollDepartment, PayrollPosition, Attendance],
      'payrollConnection',
    ),
  ],
  controllers: [SyncController],
  providers: [SyncService, DatabaseConnectionsService],
  exports: [SyncService],
})
export class SyncModule {}
