/**
 * Business rule overrides cho các service cần nghiệp vụ.
 * File này extend CrudService với validation logic theo SRS IEEE 830-1998.
 */
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ShiftAssignment } from '../../database/payroll/entities/shift-assignment.entity';
import { WorkShift } from '../../database/payroll/entities/work-shift.entity';
import { OvertimeRequest } from '../../database/payroll/entities/overtime-request.entity';
import { LeaveRequest } from '../../database/payroll/entities/leave-request.entity';
import { SalaryPolicy } from '../../database/payroll/entities/salary-policy.entity';
import { BenefitsInsurance } from '../../database/payroll/entities/benefits-insurance.entity';
import { OnboardingOffboarding } from '../../database/payroll/entities/onboarding-offboarding.entity';
import { EmployeesPayroll } from '../../database/payroll/entities/employees-payroll.entity';
import { AuditService, AuditActor } from '../audit/audit.service';
import { CrudService } from '../crud/crud.service';
import { ok } from '../../common/api-response';

// ─── ShiftAssignmentsService ────────────────────────────────────────────────

@Injectable()
export class ShiftAssignmentsService extends CrudService<ShiftAssignment & Record<string, unknown>> {
  constructor(
    @InjectRepository(ShiftAssignment, 'payrollConnection')
    private readonly shiftAssignRepo: Repository<ShiftAssignment>,
    @InjectRepository(WorkShift, 'payrollConnection')
    private readonly workShiftRepo: Repository<WorkShift>,
    audit: AuditService,
  ) {
    super(shiftAssignRepo as never, {
      entityName: 'ShiftAssignment',
      idField: 'AssignmentID',
      defaultOrder: { AssignmentID: 'DESC' },
    }, audit);
  }

  override async create(body: Record<string, unknown>, actor?: AuditActor, ipAddress?: string) {
    await this.validateShiftConflict(
      Number(body.EmployeeID),
      body.EffectiveDate as string,
      body.EndDate as string | undefined,
      Number(body.ShiftID),
    );
    return super.create(body, actor, ipAddress);
  }

  override async update(id: number, body: Record<string, unknown>, actor?: AuditActor, ipAddress?: string) {
    const existing = await this.shiftAssignRepo.findOne({ where: { AssignmentID: id } });
    const employeeId = Number(body.EmployeeID ?? existing?.EmployeeID);
    const effectiveDate = (body.EffectiveDate as string | undefined) ?? existing?.EffectiveDate?.toString();
    const endDate = (body.EndDate as string | undefined) ?? existing?.EndDate?.toString();
    const shiftId = Number(body.ShiftID ?? existing?.ShiftID);
    await this.validateShiftConflict(employeeId, effectiveDate!, endDate, shiftId, id);
    return super.update(id, body, actor, ipAddress);
  }

  private async validateShiftConflict(
    employeeId: number,
    effectiveDate: string,
    endDate: string | undefined,
    shiftId: number,
    excludeId?: number,
  ) {
    if (!employeeId || !effectiveDate) return;

    // Lấy thông tin ca mới
    const newShift = await this.workShiftRepo.findOne({ where: { ShiftID: shiftId } });

    // Tìm tất cả ca đã assign cho nhân viên có ngày chồng nhau
    const qb = this.shiftAssignRepo
      .createQueryBuilder('sa')
      .where('sa.EmployeeID = :employeeId', { employeeId })
      .andWhere('sa.EffectiveDate <= :endDate', {
        endDate: endDate ?? effectiveDate,
      })
      .andWhere('(sa.EndDate IS NULL OR sa.EndDate >= :effectiveDate)', { effectiveDate });

    if (excludeId) {
      qb.andWhere('sa.AssignmentID != :excludeId', { excludeId });
    }

    const conflicts = await qb.getMany();
    if (!conflicts.length) return;

    // Kiểm tra trùng giờ nếu có thông tin shift
    if (newShift) {
      for (const conflict of conflicts) {
        const existingShift = await this.workShiftRepo.findOne({
          where: { ShiftID: conflict.ShiftID },
        });
        if (!existingShift) continue;

        const newStart = newShift.StartTime;
        const newEnd = newShift.EndTime;
        const exStart = existingShift.StartTime;
        const exEnd = existingShift.EndTime;

        // Kiểm tra overlap giờ: (newStart < exEnd) AND (newEnd > exStart)
        if (newStart < exEnd && newEnd > exStart) {
          throw new BadRequestException(
            `Nhân viên đã có ca làm việc trùng ngày/giờ (ca ${existingShift.ShiftName} từ ${exStart} đến ${exEnd})`,
          );
        }
      }
    } else if (conflicts.length > 0) {
      throw new BadRequestException(
        'Nhân viên đã có ca làm việc trong khoảng thời gian này',
      );
    }
  }
}

// ─── OvertimeRequestsService ────────────────────────────────────────────────

@Injectable()
export class OvertimeRequestsService extends CrudService<OvertimeRequest & Record<string, unknown>> {
  constructor(
    @InjectRepository(OvertimeRequest, 'payrollConnection')
    private readonly overtimeRepo: Repository<OvertimeRequest>,
    @InjectRepository(ShiftAssignment, 'payrollConnection')
    private readonly shiftAssignRepo: Repository<ShiftAssignment>,
    @InjectRepository(LeaveRequest, 'payrollConnection')
    private readonly leaveRepo: Repository<LeaveRequest>,
    audit: AuditService,
  ) {
    super(overtimeRepo as never, {
      entityName: 'OvertimeRequest',
      idField: 'OvertimeID',
      searchFields: ['OvertimeType', 'Status', 'Reason'],
      softDeleteField: 'Status',
      softDeleteValue: 'Cancelled',
      defaultOrder: { OvertimeID: 'DESC' },
    }, audit);
  }

  override async create(body: Record<string, unknown>, actor?: AuditActor, ipAddress?: string) {
    await this.validateOvertimeConflict(
      Number(body.EmployeeID),
      body.OvertimeDate as string,
      body.StartTime as string,
      body.EndTime as string,
    );
    return super.create(body, actor, ipAddress);
  }

  override async update(id: number, body: Record<string, unknown>, actor?: AuditActor, ipAddress?: string) {
    const existing = await this.overtimeRepo.findOne({ where: { OvertimeID: id } });
    await this.validateOvertimeConflict(
      Number(body.EmployeeID ?? existing?.EmployeeID),
      (body.OvertimeDate as string | undefined) ?? existing?.OvertimeDate?.toString(),
      (body.StartTime as string | undefined) ?? existing?.StartTime,
      (body.EndTime as string | undefined) ?? existing?.EndTime,
      id,
    );
    return super.update(id, body, actor, ipAddress);
  }

  private async validateOvertimeConflict(
    employeeId: number,
    overtimeDate?: string,
    startTime?: string,
    endTime?: string,
    excludeId?: number,
  ) {
    if (!employeeId || !overtimeDate) return;

    // Chặn nếu ngày đó đang có leave approved
    const leaveConflict = await this.leaveRepo
      .createQueryBuilder('lr')
      .where('lr.EmployeeID = :employeeId', { employeeId })
      .andWhere("lr.Status = 'Approved'")
      .andWhere('lr.StartDate <= :overtimeDate', { overtimeDate })
      .andWhere('lr.EndDate >= :overtimeDate', { overtimeDate })
      .getOne();

    if (leaveConflict) {
      throw new BadRequestException(
        `Nhân viên đang có phép được duyệt vào ngày ${overtimeDate}, không thể tạo OT`,
      );
    }

    if (!startTime || !endTime) return;
    if (startTime >= endTime) {
      throw new BadRequestException('StartTime phải nhỏ hơn EndTime');
    }

    const existingOtQb = this.overtimeRepo
      .createQueryBuilder('ot')
      .where('ot.EmployeeID = :employeeId', { employeeId })
      .andWhere('DATE(ot.OvertimeDate) = DATE(:overtimeDate)', { overtimeDate })
      .andWhere("ot.Status NOT IN ('Rejected', 'Cancelled')")
      .andWhere('ot.StartTime < :endTime', { endTime })
      .andWhere('ot.EndTime > :startTime', { startTime });

    if (excludeId) existingOtQb.andWhere('ot.OvertimeID != :excludeId', { excludeId });

    const existingOvertime = await existingOtQb.getOne();
    if (existingOvertime) {
      throw new BadRequestException(
        `Nhân viên đã có OT trùng giờ (${existingOvertime.StartTime}-${existingOvertime.EndTime})`,
      );
    }

    const shiftAssignments = await this.shiftAssignRepo
      .createQueryBuilder('sa')
      .leftJoinAndSelect('sa.shift', 'shift')
      .where('sa.EmployeeID = :employeeId', { employeeId })
      .andWhere('sa.EffectiveDate <= :overtimeDate', { overtimeDate })
      .andWhere('(sa.EndDate IS NULL OR sa.EndDate >= :overtimeDate)', { overtimeDate })
      .getMany();

    for (const assignment of shiftAssignments) {
      const shift = assignment.shift;
      if (!shift) continue;
      if (startTime < shift.EndTime && endTime > shift.StartTime) {
        throw new BadRequestException(
          `OT trùng với ca làm việc ${shift.ShiftName} (${shift.StartTime}-${shift.EndTime})`,
        );
      }
    }
  }
}

// ─── SalaryPoliciesService ──────────────────────────────────────────────────

@Injectable()
export class SalaryPoliciesService extends CrudService<SalaryPolicy & Record<string, unknown>> {
  constructor(
    @InjectRepository(SalaryPolicy, 'payrollConnection')
    private readonly policyRepo: Repository<SalaryPolicy>,
    audit: AuditService,
  ) {
    super(policyRepo as never, {
      entityName: 'SalaryPolicy',
      idField: 'PolicyID',
      searchFields: ['PolicyName', 'PolicyCode', 'Description'],
      softDeleteField: 'IsActive',
      softDeleteValue: false,
      defaultOrder: { PolicyID: 'DESC' },
    }, audit);
  }

  override async create(body: Record<string, unknown>, actor?: AuditActor, ipAddress?: string) {
    await this.validatePolicyRules(body);
    return super.create(body, actor, ipAddress);
  }

  override async update(id: number, body: Record<string, unknown>, actor?: AuditActor, ipAddress?: string) {
    await this.validatePolicyRules(body, id);
    return super.update(id, body, actor, ipAddress);
  }

  /** Clone một policy để tạo policy mới với suffix _COPY */
  async clonePolicy(policyId: number, actor?: AuditActor): Promise<SalaryPolicy> {
    const source = await this.policyRepo.findOne({ where: { PolicyID: policyId } });
    if (!source) throw new BadRequestException(`Policy ${policyId} không tồn tại`);

    const cloned = this.policyRepo.create({
      ...source,
      PolicyID: undefined as unknown as number,
      PolicyName: `${source.PolicyName} (Copy)`,
      PolicyCode: source.PolicyCode ? `${source.PolicyCode}_COPY_${Date.now()}` : undefined as unknown as string,
      IsActive: false,
      EffectiveDate: undefined as unknown as Date,
      ExpiryDate: undefined as unknown as Date,
    });

    const saved = await this.policyRepo.save(cloned);
    return saved;
  }

  private async validatePolicyRules(body: Record<string, unknown>, excludeId?: number) {
    this.validatePercentFields(body, [
      'TaxRate',
      'SocialIns',
      'HealthIns',
      'UnemployIns',
    ]);

    this.validatePositiveRateFields(body, ['OvertimeRate', 'HolidayRate']);

    // 1. Chặn EffectiveDate trong quá khứ
    if (body.EffectiveDate) {
      const effDate = new Date(body.EffectiveDate as string);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (effDate < today) {
        throw new BadRequestException(
          'EffectiveDate không được nhỏ hơn ngày hiện tại',
        );
      }
    }

    // 2. Chặn nhiều policy ACTIVE overlap
    if (body.IsActive) {
      const qb = this.policyRepo
        .createQueryBuilder('p')
        .where('p.IsActive = 1');

      if (excludeId) qb.andWhere('p.PolicyID != :excludeId', { excludeId });

      const activeCount = await qb.getCount();
      if (activeCount > 0) {
        throw new BadRequestException(
          'Đã có policy đang ACTIVE. Vui lòng vô hiệu hoá policy cũ trước khi kích hoạt policy mới.',
        );
      }
    }
  }

  private validatePercentFields(body: Record<string, unknown>, fields: string[]) {
    for (const field of fields) {
      if (body[field] === undefined || body[field] === null || body[field] === '') continue;
      const value = Number(body[field]);
      if (!Number.isFinite(value) || value < 0 || value > 100) {
        throw new BadRequestException(`${field} phải nằm trong khoảng 0-100%`);
      }
    }
  }

  private validatePositiveRateFields(body: Record<string, unknown>, fields: string[]) {
    for (const field of fields) {
      if (body[field] === undefined || body[field] === null || body[field] === '') continue;
      const value = Number(body[field]);
      if (!Number.isFinite(value) || value < 0) {
        throw new BadRequestException(`${field} không được âm`);
      }
    }
  }
}

// ─── BenefitsInsuranceService ───────────────────────────────────────────────

@Injectable()
export class BenefitsInsuranceService extends CrudService<BenefitsInsurance & Record<string, unknown>> {
  constructor(
    @InjectRepository(BenefitsInsurance, 'payrollConnection')
    private readonly benefitRepo: Repository<BenefitsInsurance>,
    audit: AuditService,
  ) {
    super(benefitRepo as never, {
      entityName: 'BenefitsInsurance',
      idField: 'BenefitID',
      searchFields: ['BenefitType', 'Provider', 'PolicyNumber', 'Status'],
      softDeleteField: 'Status',
      softDeleteValue: 'Cancelled',
      defaultOrder: { BenefitID: 'DESC' },
    }, audit);
  }

  override async create(body: Record<string, unknown>, actor?: AuditActor, ipAddress?: string) {
    this.validateBenefitAmounts(body);
    return super.create(body, actor, ipAddress);
  }

  override async update(id: number, body: Record<string, unknown>, actor?: AuditActor, ipAddress?: string) {
    this.validateBenefitAmounts(body);
    return super.update(id, body, actor, ipAddress);
  }

  /** Áp dụng một loại benefit cho nhiều nhân viên cùng lúc */
  async bulkApply(
    employeeIds: number[],
    benefitData: Record<string, unknown>,
    actor?: AuditActor,
  ) {
    this.validateBenefitAmounts(benefitData);
    const results: Array<{ employeeId: number; status: string }> = [];

    for (const eid of employeeIds) {
      try {
        await this.benefitRepo.save(
          this.benefitRepo.create({ ...benefitData, EmployeeID: eid } as never),
        );
        results.push({ employeeId: eid, status: 'ok' });
      } catch {
        results.push({ employeeId: eid, status: 'failed' });
      }
    }

    return { status: 'success', message: 'Bulk apply hoàn tất', data: results };
  }

  private validateBenefitAmounts(body: Record<string, unknown>) {
    const fields = ['MonthlyCost', 'EmployerShare', 'EmployeeShare'] as const;
    for (const field of fields) {
      if (body[field] !== undefined && Number(body[field]) < 0) {
        throw new BadRequestException(`${field} không được âm`);
      }
    }

    const monthlyCost = Number(body.MonthlyCost ?? 0);
    const employerShare = Number(body.EmployerShare ?? 0);
    const employeeShare = Number(body.EmployeeShare ?? 0);

    if (monthlyCost > 0 && employerShare + employeeShare > monthlyCost) {
      throw new BadRequestException(
        'EmployerShare + EmployeeShare không được lớn hơn MonthlyCost',
      );
    }

    const percentFields = ['EmployerShareRate', 'EmployeeShareRate', 'Rate'];
    for (const field of percentFields) {
      if (body[field] === undefined || body[field] === null || body[field] === '') continue;
      const value = Number(body[field]);
      if (!Number.isFinite(value) || value < 0 || value > 100) {
        throw new BadRequestException(`${field} phải nằm trong khoảng 0-100%`);
      }
    }
  }
}

// ─── OnboardingOffboardingService ──────────────────────────────────────────

@Injectable()
export class OnboardingOffboardingService extends CrudService<OnboardingOffboarding & Record<string, unknown>> {
  constructor(
    @InjectRepository(OnboardingOffboarding, 'payrollConnection')
    private readonly onboardRepo: Repository<OnboardingOffboarding>,
    @InjectRepository(EmployeesPayroll, 'payrollConnection')
    private readonly employeeRepo: Repository<EmployeesPayroll>,
    @InjectDataSource('payrollConnection')
    private readonly dataSource: DataSource,
    audit: AuditService,
  ) {
    super(onboardRepo as never, {
      entityName: 'OnboardingOffboarding',
      idField: 'RecordID',
      searchFields: ['ProcessType', 'Status', 'Notes'],
      softDeleteField: 'Status',
      softDeleteValue: 'Cancelled',
      defaultOrder: { RecordID: 'DESC' },
    }, audit);
  }

  override async create(body: Record<string, unknown>, actor?: AuditActor, ipAddress?: string) {
    return this.dataSource.transaction(async (manager) => {
      const record = manager.create(OnboardingOffboarding, body as never);
      const saved = await manager.save(OnboardingOffboarding, record);
      await this.syncEmployeeStatus(manager, saved);
      return ok('OnboardingOffboarding created', saved as OnboardingOffboarding & Record<string, unknown>);
    });
  }

  override async update(id: number, body: Record<string, unknown>, actor?: AuditActor, ipAddress?: string) {
    return this.dataSource.transaction(async (manager) => {
      const existing = await manager.findOne(OnboardingOffboarding, { where: { RecordID: id } });
      if (!existing) throw new BadRequestException(`Record ${id} không tồn tại`);
      Object.assign(existing, body);
      const saved = await manager.save(OnboardingOffboarding, existing);
      await this.syncEmployeeStatus(manager, saved);
      return ok('OnboardingOffboarding updated', saved as OnboardingOffboarding & Record<string, unknown>);
    });
  }

  private async syncEmployeeStatus(
    manager: import('typeorm').EntityManager,
    record: OnboardingOffboarding,
  ) {
    if (record.Status !== 'Completed') return;
    if (!record.EmployeeID) return;

    let newStatus: string | null = null;
    if (record.ProcessType === 'Onboarding') newStatus = 'Active';
    if (record.ProcessType === 'Offboarding') newStatus = 'Inactive';

    if (newStatus) {
      await manager.update(EmployeesPayroll, { EmployeeID: record.EmployeeID }, {
        Status: newStatus,
        SyncedAt: new Date(),
      });
    }
  }
}
