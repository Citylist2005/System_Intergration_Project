import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BenefitsInsurance } from '../../database/payroll/entities/benefits-insurance.entity';
import { PayrollDepartment } from '../../database/payroll/entities/departments-payroll.entity';
import { EmployeeLifecycle } from '../../database/payroll/entities/employee-lifecycle.entity';
import { KpiOkr } from '../../database/payroll/entities/kpi-okr.entity';
import { LeaveRequest } from '../../database/payroll/entities/leave-request.entity';
import { OnboardingOffboarding } from '../../database/payroll/entities/onboarding-offboarding.entity';
import { OvertimeRequest } from '../../database/payroll/entities/overtime-request.entity';
import { PayrollAdjustment } from '../../database/payroll/entities/payroll-adjustment.entity';
import { PerformanceReview } from '../../database/payroll/entities/performance-review.entity';
import { PayrollPosition } from '../../database/payroll/entities/positions-payroll.entity';
import { SalaryPolicy } from '../../database/payroll/entities/salary-policy.entity';
import { ShiftAssignment } from '../../database/payroll/entities/shift-assignment.entity';
import { SystemBackup } from '../../database/payroll/entities/system-backup.entity';
import { User } from '../../database/payroll/entities/user.entity';
import { WorkShift } from '../../database/payroll/entities/work-shift.entity';
import { AuditModule } from '../audit/audit.module';
import {
  BenefitsInsuranceController,
  DepartmentsController,
  EmployeeLifecycleController,
  KpiOkrController,
  LeaveRequestsController,
  OnboardingOffboardingController,
  OvertimeRequestsController,
  PayrollAdjustmentsController,
  PerformanceEvaluationController,
  PositionsController,
  SalaryPoliciesController,
  ShiftAssignmentsController,
  SystemBackupController,
  UsersController,
  WorkShiftsController,
} from './srs.controllers';
import {
  BenefitsInsuranceService,
  DepartmentsService,
  EmployeeLifecycleService,
  KpiOkrService,
  LeaveRequestsService,
  OnboardingOffboardingService,
  OvertimeRequestsService,
  PayrollAdjustmentsService,
  PerformanceEvaluationService,
  PositionsService,
  SalaryPoliciesService,
  ShiftAssignmentsService,
  SystemBackupService,
  UsersService,
  WorkShiftsService,
} from './srs.services';

@Module({
  imports: [
    AuditModule,
    TypeOrmModule.forFeature(
      [
        BenefitsInsurance,
        PayrollDepartment,
        EmployeeLifecycle,
        KpiOkr,
        LeaveRequest,
        OnboardingOffboarding,
        OvertimeRequest,
        PayrollAdjustment,
        PerformanceReview,
        PayrollPosition,
        SalaryPolicy,
        ShiftAssignment,
        SystemBackup,
        User,
        WorkShift,
      ],
      'payrollConnection',
    ),
  ],
  controllers: [
    BenefitsInsuranceController,
    DepartmentsController,
    EmployeeLifecycleController,
    KpiOkrController,
    LeaveRequestsController,
    OnboardingOffboardingController,
    OvertimeRequestsController,
    PayrollAdjustmentsController,
    PerformanceEvaluationController,
    PositionsController,
    SalaryPoliciesController,
    ShiftAssignmentsController,
    SystemBackupController,
    UsersController,
    WorkShiftsController,
  ],
  providers: [
    BenefitsInsuranceService,
    DepartmentsService,
    EmployeeLifecycleService,
    KpiOkrService,
    LeaveRequestsService,
    OnboardingOffboardingService,
    OvertimeRequestsService,
    PayrollAdjustmentsService,
    PerformanceEvaluationService,
    PositionsService,
    SalaryPoliciesService,
    ShiftAssignmentsService,
    SystemBackupService,
    UsersService,
    WorkShiftsService,
  ],
})
export class SrsFeaturesModule {}
