import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { Permissions } from '../auth/permissions.decorator';
import { CrudService } from '../crud/crud.service';
import {
  DepartmentsService,
  EmployeeLifecycleService,
  KpiOkrService,
  LeaveRequestsService,
  PayrollAdjustmentsService,
  PerformanceEvaluationService,
  PositionsService,
  SystemBackupService,
  UsersService,
  WorkShiftsService,
} from './srs.services';
import {
  BenefitsInsuranceService,
  OnboardingOffboardingService,
  OvertimeRequestsService,
  SalaryPoliciesService,
  ShiftAssignmentsService,
} from './business-rules.services';

type AuthRequest = Request & { user?: { sub?: number; username?: string; role?: string } };
type QueryParams = { search?: string; page?: number; limit?: number };

abstract class BaseCrudController {
  protected constructor(private readonly service: CrudService<Record<string, unknown>>) {}

  @Get()
  findAll(@Query() query: QueryParams, @Req() request: AuthRequest) {
    return this.service.findAll(query, request.user);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: Record<string, unknown>, @Req() request: AuthRequest) {
    return this.service.create(body, request.user, request.ip);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Record<string, unknown>,
    @Req() request: AuthRequest,
  ) {
    return this.service.update(id, body, request.user, request.ip);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() request: AuthRequest) {
    return this.service.remove(id, request.user, request.ip);
  }
}

@Controller('departments')
@Permissions('department.manage')
export class DepartmentsController extends BaseCrudController {
  constructor(service: DepartmentsService) {
    super(service);
  }
}

@Controller('positions')
@Permissions('position.manage')
export class PositionsController extends BaseCrudController {
  constructor(service: PositionsService) {
    super(service);
  }
}

@Controller('work-shifts')
@Permissions('shift.manage')
export class WorkShiftsController extends BaseCrudController {
  constructor(service: WorkShiftsService) {
    super(service);
  }
}

@Controller('shift-assignments')
@Permissions('shift.manage')
export class ShiftAssignmentsController extends BaseCrudController {
  constructor(service: ShiftAssignmentsService) {
    super(service);
  }
}

@Controller('leave-requests')
@Permissions('leave.manage')
export class LeaveRequestsController extends BaseCrudController {
  constructor(service: LeaveRequestsService) {
    super(service);
  }
}

@Controller('overtime-requests')
@Permissions('overtime.manage')
export class OvertimeRequestsController extends BaseCrudController {
  constructor(service: OvertimeRequestsService) {
    super(service);
  }
}

@Controller('salary-policies')
@Permissions('payroll.manage')
export class SalaryPoliciesController extends BaseCrudController {
  constructor(private readonly salaryPoliciesService: SalaryPoliciesService) {
    super(salaryPoliciesService);
  }

  @Post(':id/clone')
  clonePolicy(@Param('id', ParseIntPipe) id: number, @Req() request: AuthRequest) {
    return this.salaryPoliciesService.clonePolicy(id, request.user);
  }
}

@Controller('benefits-insurance')
@Permissions('payroll.manage')
export class BenefitsInsuranceController extends BaseCrudController {
  constructor(private readonly benefitsInsuranceService: BenefitsInsuranceService) {
    super(benefitsInsuranceService);
  }

  @Post('bulk-apply')
  bulkApply(
    @Body() body: { employeeIds: number[]; benefitData: Record<string, unknown> },
    @Req() request: AuthRequest,
  ) {
    return this.benefitsInsuranceService.bulkApply(
      body.employeeIds ?? [],
      body.benefitData ?? {},
      request.user,
    );
  }
}

/* replaced by extended controller above */
class LegacySalaryPoliciesController extends BaseCrudController {
  constructor(service: SalaryPoliciesService) {
    super(service);
  }
}

class LegacyBenefitsInsuranceController extends BaseCrudController {
  constructor(service: BenefitsInsuranceService) {
    super(service);
  }
}

@Controller('payroll-adjustments')
@Permissions('payroll.manage')
export class PayrollAdjustmentsController extends BaseCrudController {
  constructor(service: PayrollAdjustmentsService) {
    super(service);
  }
}

@Controller('employee-lifecycle')
@Permissions('employee.manage')
export class EmployeeLifecycleController extends BaseCrudController {
  constructor(service: EmployeeLifecycleService) {
    super(service);
  }
}

@Controller('onboarding-offboarding')
@Permissions('employee.manage')
export class OnboardingOffboardingController extends BaseCrudController {
  constructor(service: OnboardingOffboardingService) {
    super(service);
  }
}

@Controller('kpi-okr')
@Permissions('kpi.manage')
export class KpiOkrController extends BaseCrudController {
  constructor(service: KpiOkrService) {
    super(service);
  }
}

@Controller('performance-evaluation')
@Permissions('performance.manage')
export class PerformanceEvaluationController extends BaseCrudController {
  constructor(private readonly performanceService: PerformanceEvaluationService) {
    super(performanceService);
  }

  @Post('auto-calculate')
  autoCalculate(
    @Body()
    body: {
      EmployeeID: number;
      ReviewPeriod: string;
      ReviewerID?: number;
      Status?: string;
      Strengths?: string;
      Weaknesses?: string;
      Goals?: string;
    },
  ) {
    return this.performanceService.autoCalculate(body);
  }
}

@Controller('users')
@Permissions('user.manage')
export class UsersController extends BaseCrudController {
  constructor(service: UsersService) {
    super(service);
  }
}

@Controller('system-backup')
@Permissions('backup.manage')
export class SystemBackupController extends BaseCrudController {
  constructor(private readonly systemBackupService: SystemBackupService) {
    super(systemBackupService);
  }

  @Post(':id/restore')
  restore(@Param('id', ParseIntPipe) id: number, @Req() request: AuthRequest) {
    return this.systemBackupService.restore(id, request.user);
  }
}
