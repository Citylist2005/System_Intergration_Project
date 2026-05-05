import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
import { Attendance } from '../../database/payroll/entities/attendance.entity';
import { AuditService } from '../audit/audit.service';
import { hashPassword } from '../auth/password.service';
import { CrudService } from '../crud/crud.service';
import { execFile, spawn } from 'child_process';
import { createReadStream, existsSync, mkdirSync } from 'fs';
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
  constructor(
    @InjectRepository(PerformanceReview, 'payrollConnection')
    private readonly performanceRepo: Repository<PerformanceReview>,
    @InjectRepository(Attendance, 'payrollConnection')
    private readonly attendanceRepo: Repository<Attendance>,
    @InjectRepository(KpiOkr, 'payrollConnection')
    private readonly kpiRepo: Repository<KpiOkr>,
    audit: AuditService,
  ) {
    super(performanceRepo as never, { entityName: 'PerformanceReview', idField: 'ReviewID', searchFields: ['ReviewPeriod', 'Grade', 'Status', 'Strengths', 'Goals'], softDeleteField: 'Status', softDeleteValue: 'Rejected', defaultOrder: { ReviewID: 'DESC' } }, audit);
  }

  async autoCalculate(body: {
    EmployeeID: number;
    ReviewPeriod: string;
    ReviewerID?: number;
    Status?: string;
    Strengths?: string;
    Weaknesses?: string;
    Goals?: string;
  }) {
    if (!body.EmployeeID || !body.ReviewPeriod) {
      throw new BadRequestException('EmployeeID và ReviewPeriod là bắt buộc');
    }

    const period = this.parseReviewPeriod(body.ReviewPeriod);
    const attendanceScore = await this.calculateAttendanceScore(
      body.EmployeeID,
      period,
    );
    const kpiScore = await this.calculateKpiScore(body.EmployeeID, body.ReviewPeriod, period);
    const overallScore = Number((kpiScore * 0.6 + attendanceScore * 0.4).toFixed(2));

    let record = await this.performanceRepo.findOne({
      where: { EmployeeID: body.EmployeeID, ReviewPeriod: body.ReviewPeriod },
      order: { ReviewID: 'DESC' },
    });

    record =
      record ??
      this.performanceRepo.create({
        EmployeeID: body.EmployeeID,
        ReviewPeriod: body.ReviewPeriod,
      });

    record.ReviewDate = new Date();
    record.ReviewerID = body.ReviewerID ?? record.ReviewerID;
    record.OverallScore = overallScore;
    record.Competency = this.toFivePoint(kpiScore);
    record.Attitude = this.toFivePoint(attendanceScore);
    record.Teamwork = this.toFivePoint(overallScore);
    record.Productivity = this.toFivePoint(overallScore);
    record.Leadership = record.Leadership ?? null;
    record.Grade = this.gradeFromScore(overallScore);
    record.Status = body.Status ?? 'Submitted';
    record.Strengths = body.Strengths ?? record.Strengths;
    record.Weaknesses = body.Weaknesses ?? record.Weaknesses;
    record.Goals = body.Goals ?? record.Goals;

    const saved = await this.performanceRepo.save(record);
    return {
      status: 'success',
      message: 'Đã tự động tính đánh giá hiệu suất từ KPI và chấm công',
      data: saved,
    };
  }

  private parseReviewPeriod(period: string): { year?: number; month?: number; quarter?: number } {
    const monthly = /^(\d{4})-(\d{2})$/.exec(period);
    if (monthly) return { year: Number(monthly[1]), month: Number(monthly[2]) };

    const quarterly = /^(\d{4})-Q([1-4])$/i.exec(period);
    if (quarterly) return { year: Number(quarterly[1]), quarter: Number(quarterly[2]) };

    const yearly = /^(\d{4})$/.exec(period);
    if (yearly) return { year: Number(yearly[1]) };

    return {};
  }

  private async calculateAttendanceScore(
    employeeId: number,
    period: { year?: number; month?: number; quarter?: number },
  ) {
    const qb = this.attendanceRepo
      .createQueryBuilder('attendance')
      .select('SUM(COALESCE(attendance.WorkDays, 0))', 'workDays')
      .addSelect('SUM(COALESCE(attendance.AbsentDays, 0))', 'absentDays')
      .addSelect('SUM(COALESCE(attendance.LeaveDays, 0))', 'leaveDays')
      .where('attendance.EmployeeID = :employeeId', { employeeId });

    this.applyPeriodFilter(qb, 'attendance.AttendanceMonth', period);
    const row = await qb.getRawOne<{ workDays: string; absentDays: string; leaveDays: string }>();

    const workDays = Number(row?.workDays ?? 0);
    const absentDays = Number(row?.absentDays ?? 0);
    const leaveDays = Number(row?.leaveDays ?? 0);
    const total = workDays + absentDays + leaveDays;

    if (total <= 0) return 100;
    return Math.max(0, Math.min(100, Number(((workDays / total) * 100).toFixed(2))));
  }

  private async calculateKpiScore(
    employeeId: number,
    reviewPeriod: string,
    period: { year?: number; month?: number; quarter?: number },
  ) {
    const qb = this.kpiRepo
      .createQueryBuilder('kpi')
      .select('SUM(COALESCE(kpi.Score, 0) * COALESCE(kpi.Weight, 100))', 'weightedScore')
      .addSelect('SUM(COALESCE(kpi.Weight, 100))', 'weight')
      .where('kpi.EmployeeID = :employeeId', { employeeId })
      .andWhere("kpi.Status NOT IN ('Cancelled', 'Rejected')");

    if (period.year) {
      qb.andWhere('(kpi.Period = :reviewPeriod OR kpi.Period LIKE :periodPrefix)', {
        reviewPeriod,
        periodPrefix: `${period.year}%`,
      });
    } else {
      qb.andWhere('kpi.Period = :reviewPeriod', { reviewPeriod });
    }

    const row = await qb.getRawOne<{ weightedScore: string; weight: string }>();
    const weight = Number(row?.weight ?? 0);
    if (weight <= 0) return 100;
    return Math.max(0, Math.min(100, Number((Number(row?.weightedScore ?? 0) / weight).toFixed(2))));
  }

  private applyPeriodFilter(
    qb: import('typeorm').SelectQueryBuilder<Attendance>,
    dateColumn: string,
    period: { year?: number; month?: number; quarter?: number },
  ) {
    if (period.year) qb.andWhere(`YEAR(${dateColumn}) = :year`, { year: period.year });
    if (period.month) qb.andWhere(`MONTH(${dateColumn}) = :month`, { month: period.month });
    if (period.quarter) {
      const startMonth = (period.quarter - 1) * 3 + 1;
      qb.andWhere(`MONTH(${dateColumn}) BETWEEN :startMonth AND :endMonth`, {
        startMonth,
        endMonth: startMonth + 2,
      });
    }
  }

  private toFivePoint(score: number) {
    return Number((Math.max(0, Math.min(100, score)) / 20).toFixed(2));
  }

  private gradeFromScore(score: number) {
    if (score >= 95) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 75) return 'B+';
    if (score >= 65) return 'B';
    if (score >= 50) return 'C';
    return 'D';
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
  constructor(
    @InjectRepository(SystemBackup, 'payrollConnection')
    private readonly backupRepo: Repository<SystemBackup>,
    private readonly backupAuditService: AuditService,
  ) {
    super(backupRepo as never, { entityName: 'SystemBackup', idField: 'BackupID', searchFields: ['BackupType', 'BackupName', 'Status', 'Notes'], defaultOrder: { BackupID: 'DESC' } }, backupAuditService);
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

  async restore(backupId: number, actor?: import('../audit/audit.service').AuditActor) {
    const record = await this.backupRepo.findOne({ where: { BackupID: backupId } });
    if (!record) throw new NotFoundException(`Backup ${backupId} khÃ´ng tá»“n táº¡i`);
    if (record.Status !== 'Completed') throw new BadRequestException('Chá»‰ cÃ³ thá»ƒ restore backup Ä‘Ã£ hoÃ n táº¥t');
    if (!record.FilePath || !existsSync(record.FilePath)) throw new BadRequestException('File backup khÃ´ng tá»“n táº¡i');

    await this.backupAuditService.write({
      actor,
      action: 'RESTORE_INITIATED',
      entityType: 'SystemBackup',
      entityId: backupId,
      newValues: { filePath: record.FilePath },
    });

    const args = [
      `-h${process.env.PAYROLL_DB_HOST || 'localhost'}`,
      `-P${process.env.PAYROLL_DB_PORT || '3306'}`,
      `-u${process.env.PAYROLL_DB_USER || 'root'}`,
      `-p${process.env.PAYROLL_DB_PASS || ''}`,
      process.env.PAYROLL_DB_NAME || 'payroll_2026',
    ];

    const result = await new Promise<{ ok: boolean; message?: string }>((resolve) => {
      const child = spawn('mysql', args, { stdio: ['pipe', 'ignore', 'pipe'] });
      let errorOutput = '';
      child.stderr.on('data', (chunk: Buffer) => {
        errorOutput += chunk.toString();
      });
      child.on('error', (error) => resolve({ ok: false, message: error.message }));
      child.on('close', (code) => {
        resolve(code === 0 ? { ok: true } : { ok: false, message: errorOutput || `mysql exited with ${code}` });
      });
      createReadStream(record.FilePath).pipe(child.stdin);
    });

    if (!result.ok) {
      await this.backupAuditService.write({
        actor,
        action: 'RESTORE_FAILED',
        entityType: 'SystemBackup',
        entityId: backupId,
        newValues: { error: result.message },
      });
      throw new BadRequestException(`Restore tháº¥t báº¡i: ${result.message}`);
    }

    record.RestoredAt = new Date();
    record.RestoredBy = actor?.sub ?? null;
    const saved = await this.backupRepo.save(record);

    await this.backupAuditService.write({
      actor,
      action: 'RESTORE_COMPLETED',
      entityType: 'SystemBackup',
      entityId: backupId,
      newValues: saved,
    });

    return { status: 'success', message: 'Restore backup thÃ nh cÃ´ng', data: saved };
  }
}
