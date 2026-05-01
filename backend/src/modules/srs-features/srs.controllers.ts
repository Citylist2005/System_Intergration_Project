import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { Roles } from '../auth/roles.decorator';
import { CrudService } from '../crud/crud.service';
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
@Roles('Admin', 'HR_Manager')
export class DepartmentsController extends BaseCrudController {
  constructor(service: DepartmentsService) {
    super(service);
  }
}

@Controller('positions')
@Roles('Admin', 'HR_Manager')
export class PositionsController extends BaseCrudController {
  constructor(service: PositionsService) {
    super(service);
  }
}

@Controller('work-shifts')
@Roles('Admin', 'HR_Manager', 'Payroll_Manager')
export class WorkShiftsController extends BaseCrudController {
  constructor(service: WorkShiftsService) {
    super(service);
  }
}

@Controller('shift-assignments')
@Roles('Admin', 'HR_Manager', 'Payroll_Manager')
export class ShiftAssignmentsController extends BaseCrudController {
  constructor(service: ShiftAssignmentsService) {
    super(service);
  }
}

@Controller('leave-requests')
@Roles('Admin', 'HR_Manager', 'Employee')
export class LeaveRequestsController extends BaseCrudController {
  constructor(service: LeaveRequestsService) {
    super(service);
  }
}

@Controller('overtime-requests')
@Roles('Admin', 'HR_Manager', 'Payroll_Manager', 'Employee')
export class OvertimeRequestsController extends BaseCrudController {
  constructor(service: OvertimeRequestsService) {
    super(service);
  }
}

@Controller('salary-policies')
@Roles('Admin', 'Payroll_Manager')
export class SalaryPoliciesController extends BaseCrudController {
  constructor(service: SalaryPoliciesService) {
    super(service);
  }
}

@Controller('benefits-insurance')
@Roles('Admin', 'Payroll_Manager')
export class BenefitsInsuranceController extends BaseCrudController {
  constructor(service: BenefitsInsuranceService) {
    super(service);
  }
}

@Controller('payroll-adjustments')
@Roles('Admin', 'Payroll_Manager')
export class PayrollAdjustmentsController extends BaseCrudController {
  constructor(service: PayrollAdjustmentsService) {
    super(service);
  }
}

@Controller('employee-lifecycle')
@Roles('Admin', 'HR_Manager')
export class EmployeeLifecycleController extends BaseCrudController {
  constructor(service: EmployeeLifecycleService) {
    super(service);
  }
}

@Controller('onboarding-offboarding')
@Roles('Admin', 'HR_Manager')
export class OnboardingOffboardingController extends BaseCrudController {
  constructor(service: OnboardingOffboardingService) {
    super(service);
  }
}

@Controller('kpi-okr')
@Roles('Admin', 'HR_Manager', 'Employee')
export class KpiOkrController extends BaseCrudController {
  constructor(service: KpiOkrService) {
    super(service);
  }
}

@Controller('performance-evaluation')
@Roles('Admin', 'HR_Manager', 'Employee')
export class PerformanceEvaluationController extends BaseCrudController {
  constructor(service: PerformanceEvaluationService) {
    super(service);
  }
}

@Controller('users')
@Roles('Admin')
export class UsersController extends BaseCrudController {
  constructor(service: UsersService) {
    super(service);
  }
}

@Controller('system-backup')
@Roles('Admin')
export class SystemBackupController extends BaseCrudController {
  constructor(service: SystemBackupService) {
    super(service);
  }
}
