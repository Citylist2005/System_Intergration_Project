import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
import { AuditService } from '../audit/audit.service';
import { hashPassword } from '../auth/password.service';
import { CrudService } from '../crud/crud.service';
import { execFile } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

@Injectable()
export class DepartmentsService extends CrudService<PayrollDepartment & Record<string, unknown>> {
  constructor(@InjectRepository(PayrollDepartment, 'payrollConnection') repo: Repository<PayrollDepartment>, audit: AuditService) {
    super(repo as never, { entityName: 'Department', idField: 'DepartmentID', searchFields: ['DepartmentName'], defaultOrder: { DepartmentID: 'ASC' } }, audit);
  }
}

@Injectable()
export class PositionsService extends CrudService<PayrollPosition & Record<string, unknown>> {
  constructor(@InjectRepository(PayrollPosition, 'payrollConnection') repo: Repository<PayrollPosition>, audit: AuditService) {
    super(repo as never, { entityName: 'Position', idField: 'PositionID', searchFields: ['PositionName'], defaultOrder: { PositionID: 'ASC' } }, audit);
  }
}

@Injectable()
export class WorkShiftsService extends CrudService<WorkShift & Record<string, unknown>> {
  constructor(@InjectRepository(WorkShift, 'payrollConnection') repo: Repository<WorkShift>, audit: AuditService) {
    super(repo as never, { entityName: 'WorkShift', idField: 'ShiftID', searchFields: ['ShiftName', 'Description'], softDeleteField: 'IsActive', softDeleteValue: false, defaultOrder: { ShiftID: 'DESC' } }, audit);
  }
}

@Injectable()
export class ShiftAssignmentsService extends CrudService<ShiftAssignment & Record<string, unknown>> {
  constructor(@InjectRepository(ShiftAssignment, 'payrollConnection') repo: Repository<ShiftAssignment>, audit: AuditService) {
    super(repo as never, { entityName: 'ShiftAssignment', idField: 'AssignmentID', defaultOrder: { AssignmentID: 'DESC' } }, audit);
  }
}

@Injectable()
export class LeaveRequestsService extends CrudService<LeaveRequest & Record<string, unknown>> {
  constructor(@InjectRepository(LeaveRequest, 'payrollConnection') repo: Repository<LeaveRequest>, audit: AuditService) {
    super(repo as never, { entityName: 'LeaveRequest', idField: 'LeaveID', searchFields: ['LeaveType', 'Status', 'Reason'], softDeleteField: 'Status', softDeleteValue: 'Cancelled', defaultOrder: { LeaveID: 'DESC' } }, audit);
  }
}

@Injectable()
export class OvertimeRequestsService extends CrudService<OvertimeRequest & Record<string, unknown>> {
  constructor(@InjectRepository(OvertimeRequest, 'payrollConnection') repo: Repository<OvertimeRequest>, audit: AuditService) {
    super(repo as never, { entityName: 'OvertimeRequest', idField: 'OvertimeID', searchFields: ['OvertimeType', 'Status', 'Reason'], softDeleteField: 'Status', softDeleteValue: 'Cancelled', defaultOrder: { OvertimeID: 'DESC' } }, audit);
  }
}

@Injectable()
export class SalaryPoliciesService extends CrudService<SalaryPolicy & Record<string, unknown>> {
  constructor(@InjectRepository(SalaryPolicy, 'payrollConnection') repo: Repository<SalaryPolicy>, audit: AuditService) {
    super(repo as never, { entityName: 'SalaryPolicy', idField: 'PolicyID', searchFields: ['PolicyName', 'PolicyCode', 'Description'], softDeleteField: 'IsActive', softDeleteValue: false, defaultOrder: { PolicyID: 'DESC' } }, audit);
  }
}

@Injectable()
export class BenefitsInsuranceService extends CrudService<BenefitsInsurance & Record<string, unknown>> {
  constructor(@InjectRepository(BenefitsInsurance, 'payrollConnection') repo: Repository<BenefitsInsurance>, audit: AuditService) {
    super(repo as never, { entityName: 'BenefitsInsurance', idField: 'BenefitID', searchFields: ['BenefitType', 'Provider', 'PolicyNumber', 'Status'], softDeleteField: 'Status', softDeleteValue: 'Cancelled', defaultOrder: { BenefitID: 'DESC' } }, audit);
  }
}

@Injectable()
export class PayrollAdjustmentsService extends CrudService<PayrollAdjustment & Record<string, unknown>> {
  constructor(@InjectRepository(PayrollAdjustment, 'payrollConnection') repo: Repository<PayrollAdjustment>, audit: AuditService) {
    super(repo as never, { entityName: 'PayrollAdjustment', idField: 'AdjustmentID', searchFields: ['AdjustType', 'Reason', 'Status'], softDeleteField: 'Status', softDeleteValue: 'Rejected', defaultOrder: { AdjustmentID: 'DESC' } }, audit);
  }
}

@Injectable()
export class EmployeeLifecycleService extends CrudService<EmployeeLifecycle & Record<string, unknown>> {
  constructor(@InjectRepository(EmployeeLifecycle, 'payrollConnection') repo: Repository<EmployeeLifecycle>, audit: AuditService) {
    super(repo as never, { entityName: 'EmployeeLifecycle', idField: 'LifecycleID', searchFields: ['EventType', 'FromPosition', 'ToPosition', 'FromDept', 'ToDept', 'Notes'], defaultOrder: { LifecycleID: 'DESC' } }, audit);
  }
}

@Injectable()
export class OnboardingOffboardingService extends CrudService<OnboardingOffboarding & Record<string, unknown>> {
  constructor(@InjectRepository(OnboardingOffboarding, 'payrollConnection') repo: Repository<OnboardingOffboarding>, audit: AuditService) {
    super(repo as never, { entityName: 'OnboardingOffboarding', idField: 'RecordID', searchFields: ['ProcessType', 'Status', 'Notes'], softDeleteField: 'Status', softDeleteValue: 'Cancelled', defaultOrder: { RecordID: 'DESC' } }, audit);
  }
}

@Injectable()
export class KpiOkrService extends CrudService<KpiOkr & Record<string, unknown>> {
  constructor(@InjectRepository(KpiOkr, 'payrollConnection') repo: Repository<KpiOkr>, audit: AuditService) {
    super(repo as never, { entityName: 'KpiOkr', idField: 'KpiID', searchFields: ['Period', 'PeriodType', 'Title', 'Description', 'Status'], softDeleteField: 'Status', softDeleteValue: 'Cancelled', defaultOrder: { KpiID: 'DESC' } }, audit);
  }
}

@Injectable()
export class PerformanceEvaluationService extends CrudService<PerformanceReview & Record<string, unknown>> {
  constructor(@InjectRepository(PerformanceReview, 'payrollConnection') repo: Repository<PerformanceReview>, audit: AuditService) {
    super(repo as never, { entityName: 'PerformanceReview', idField: 'ReviewID', searchFields: ['ReviewPeriod', 'Grade', 'Status', 'Strengths', 'Goals'], softDeleteField: 'Status', softDeleteValue: 'Rejected', defaultOrder: { ReviewID: 'DESC' } }, audit);
  }
}

@Injectable()
export class UsersService extends CrudService<User & Record<string, unknown>> {
  constructor(@InjectRepository(User, 'payrollConnection') repo: Repository<User>, audit: AuditService) {
    super(repo as never, { entityName: 'User', idField: 'UserID', searchFields: ['Username', 'Email', 'FullName', 'Role'], softDeleteField: 'IsActive', softDeleteValue: false, defaultOrder: { UserID: 'DESC' } }, audit);
  }

  override create(body: Record<string, unknown>, actor?: import('../audit/audit.service').AuditActor, ipAddress?: string) {
    if (typeof body.PasswordHash === 'string' && !body.PasswordHash.startsWith('scrypt$')) {
      body.PasswordHash = hashPassword(body.PasswordHash);
    }
    return super.create(body, actor, ipAddress);
  }

  override update(id: number, body: Record<string, unknown>, actor?: import('../audit/audit.service').AuditActor, ipAddress?: string) {
    if (typeof body.PasswordHash === 'string' && body.PasswordHash && !body.PasswordHash.startsWith('scrypt$')) {
      body.PasswordHash = hashPassword(body.PasswordHash);
    }
    if (body.PasswordHash === '') {
      delete body.PasswordHash;
    }
    return super.update(id, body, actor, ipAddress);
  }
}

@Injectable()
export class SystemBackupService extends CrudService<SystemBackup & Record<string, unknown>> {
  constructor(@InjectRepository(SystemBackup, 'payrollConnection') private readonly backupRepo: Repository<SystemBackup>, audit: AuditService) {
    super(backupRepo as never, { entityName: 'SystemBackup', idField: 'BackupID', searchFields: ['BackupType', 'BackupName', 'Status', 'Notes'], defaultOrder: { BackupID: 'DESC' } }, audit);
  }

  override async create(body: Record<string, unknown>, actor?: import('../audit/audit.service').AuditActor, ipAddress?: string) {
    const startedAt = new Date();
    const backupDir = join(process.cwd(), 'backups');
    if (!existsSync(backupDir)) {
      mkdirSync(backupDir, { recursive: true });
    }
    const backupName = String(body.BackupName || `payroll_2026_${Date.now()}`);
    const filePath = join(backupDir, `${backupName}.sql`);
    const record = await this.backupRepo.save(this.backupRepo.create({
      BackupType: String(body.BackupType || 'Manual'),
      BackupName: backupName,
      FilePath: filePath,
      Status: 'Running',
      StartedAt: startedAt,
      CreatedBy: actor?.sub,
      Notes: String(body.Notes || ''),
    }));

    const args = [
      `-h${process.env.PAYROLL_DB_HOST || 'localhost'}`,
      `-P${process.env.PAYROLL_DB_PORT || '3306'}`,
      `-u${process.env.PAYROLL_DB_USER || 'root'}`,
      `-p${process.env.PAYROLL_DB_PASS || ''}`,
      process.env.PAYROLL_DB_NAME || 'payroll_2026',
      `--result-file=${filePath}`,
    ];

    const completed = await new Promise<{ status: string; notes?: string }>((resolve) => {
      execFile('mysqldump', args, (error) => {
        resolve(error ? { status: 'Failed', notes: error.message } : { status: 'Completed' });
      });
    });

    record.Status = completed.status;
    record.CompletedAt = new Date();
    record.Duration = Math.max(1, Math.round((record.CompletedAt.getTime() - startedAt.getTime()) / 1000));
    record.Notes = completed.notes ? `${record.Notes || ''} ${completed.notes}`.trim() : record.Notes;
    const saved = await this.backupRepo.save(record);

    return {
      success: completed.status === 'Completed',
      message: completed.status === 'Completed' ? 'Sao lưu database thành công' : 'Không chạy được mysqldump trên máy hiện tại',
      data: saved as SystemBackup & Record<string, unknown>,
    };
  }
}
