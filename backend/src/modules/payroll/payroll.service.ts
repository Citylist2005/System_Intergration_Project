import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Salary } from '../../database/payroll/entities/salaries.entity';
import { EmployeesPayroll } from '../../database/payroll/entities/employees-payroll.entity';
import { Attendance } from '../../database/payroll/entities/attendance.entity';
import { SalaryPolicy } from '../../database/payroll/entities/salary-policy.entity';
import { BenefitsInsurance } from '../../database/payroll/entities/benefits-insurance.entity';
import { PayrollAdjustment } from '../../database/payroll/entities/payroll-adjustment.entity';
import { OvertimeRequest } from '../../database/payroll/entities/overtime-request.entity';
import { KpiOkr } from '../../database/payroll/entities/kpi-okr.entity';
import { isPayrollEligibleStatus } from '../../common/employee-status';
import { UpdatePayrollDto, UpsertPayrollDto } from './dto/manual-payroll.dto';
import { PitTaxService } from '../tax/pit-tax.service';

interface FindAllParams {
  employeeId?: number;
  month?: number;
  year?: number;
  status?: string;
  page: number;
  limit: number;
}

/** Số ngày làm việc tiêu chuẩn/tháng */
const STANDARD_WORK_DAYS_PER_MONTH = 26;

/**
 * Các thành phần lương được tách rõ theo SRS.
 * Đây là kết quả trung gian dùng để lưu DB và trả ra API.
 */
export interface PayrollComponents {
  /** 1. Lương cơ bản (base salary từ hợp đồng) */
  baseSalary: number;
  /** 2. Lương gộp = baseSalary + KPI bonus + overtime pay + adjustmentAdditions */
  grossSalary: number;
  /** 3. Khấu trừ vắng mặt (attendance deduction) */
  attendanceDeduction: number;
  /** 4. Tiền tăng ca (overtime pay) */
  overtimePay: number;
  /** 5. Thưởng KPI */
  kpiBonus: number;
  /** 6. Khấu trừ BHXH nhân viên đóng (employee share) */
  insuranceDeduction: number;
  /** 7. Khấu trừ lợi ích khác (benefit deductions) */
  benefitDeductions: number;
  /** 8. Điều chỉnh lương dương (+) */
  adjustmentAdditions: number;
  /** 9. Điều chỉnh lương âm (-) */
  adjustmentDeductions: number;
  /** 10. Thu nhập tính thuế TNCN */
  taxableIncome: number;
  /** 11. Thuế TNCN (PIT) theo bậc lũy tiến */
  pitTax: number;
  /** 12. Lương thực nhận = grossSalary - attendanceDeduction - insuranceDeduction
   *                         - benefitDeductions - adjustmentDeductions - pitTax */
  netSalary: number;
}

@Injectable()
export class PayrollService {
  constructor(
    @InjectRepository(Salary, 'payrollConnection')
    private readonly salaryRepo: Repository<Salary>,

    @InjectRepository(EmployeesPayroll, 'payrollConnection')
    private readonly employeesRepo: Repository<EmployeesPayroll>,

    @InjectRepository(Attendance, 'payrollConnection')
    private readonly attendanceRepo: Repository<Attendance>,

    @InjectRepository(SalaryPolicy, 'payrollConnection')
    private readonly salaryPolicyRepo: Repository<SalaryPolicy>,

    @InjectRepository(BenefitsInsurance, 'payrollConnection')
    private readonly benefitsRepo: Repository<BenefitsInsurance>,

    @InjectRepository(PayrollAdjustment, 'payrollConnection')
    private readonly adjustmentRepo: Repository<PayrollAdjustment>,

    @InjectRepository(OvertimeRequest, 'payrollConnection')
    private readonly overtimeRepo: Repository<OvertimeRequest>,

    @InjectRepository(KpiOkr, 'payrollConnection')
    private readonly kpiRepo: Repository<KpiOkr>,

    private readonly pitTaxService: PitTaxService,
  ) {}

  // ─── Public API ─────────────────────────────────────────────────────────────

  async findAll(params: FindAllParams) {
    const { employeeId, month, year, page, limit } = params;
    const skip = (page - 1) * limit;

    const latestIdSubQuery = this.salaryRepo
      .createQueryBuilder('sub')
      .select('MAX(sub.SalaryID)', 'maxId')
      .groupBy('sub.EmployeeID')
      .addGroupBy('sub.SalaryMonth');

    const qb = this.salaryRepo
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.employee', 'e')
      .where(`s.SalaryID IN (${latestIdSubQuery.getQuery()})`)
      .andWhere('(e.Status IS NULL OR e.Status NOT IN (:...excludedStatuses))', {
        excludedStatuses: ['Inactive', 'On Leave'],
      })
      .orderBy('s.SalaryMonth', 'DESC')
      .addOrderBy('s.SalaryID', 'DESC')
      .skip(skip)
      .take(limit);

    if (employeeId) qb.andWhere('s.EmployeeID = :employeeId', { employeeId });
    if (month) qb.andWhere('MONTH(s.SalaryMonth) = :month', { month });
    if (year) qb.andWhere('YEAR(s.SalaryMonth) = :year', { year });

    const [records, total] = await qb.getManyAndCount();

    const data = await Promise.all(
      records.map((record) => this.serializeSalaryRecord(record)),
    );

    return {
      status: 'success',
      message: 'Payroll records fetched',
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async calculate(month: number, year: number, employeeIds?: number[]) {
    await this.ensureSalaryConstraints();

    let employees = await this.employeesRepo.find();
    employees = employees.filter((e) => this.isActiveEmployee(e));

    if (employeeIds?.length) {
      const idSet = new Set(employeeIds);
      employees = employees.filter((e) => idSet.has(e.EmployeeID));
    }

    const periodDate = new Date(Date.UTC(year, month - 1, 1));
    const results: Array<PayrollComponents & { EmployeeID: number; FullName: string }> = [];
    let totalNetSalary = 0;

    for (const employee of employees) {
      const existingRecord = await this.findSalaryByEmployeeAndPeriod(
        employee.EmployeeID, month, year,
      );
      const fallbackSalary = await this.salaryRepo.findOne({
        where: { EmployeeID: employee.EmployeeID },
        order: { SalaryMonth: 'DESC', SalaryID: 'DESC' },
      });
      const source = existingRecord ?? fallbackSalary;

      const baseSalary = Number(source?.BaseSalary ?? 0);
      const components = await this.computePayrollComponents(
        employee.EmployeeID, month, year, baseSalary, periodDate,
      );

      let salary = existingRecord;
      if (salary) {
        Object.assign(salary, {
          BaseSalary: components.baseSalary,
          Bonus: components.overtimePay + components.kpiBonus + components.adjustmentAdditions,
          Deductions:
            components.attendanceDeduction +
            components.insuranceDeduction +
            components.benefitDeductions +
            components.adjustmentDeductions +
            components.pitTax,
          NetSalary: components.netSalary,
          CreatedAt: new Date(),
        });
      } else {
        salary = this.salaryRepo.create({
          EmployeeID: employee.EmployeeID,
          SalaryMonth: periodDate,
          BaseSalary: components.baseSalary,
          Bonus: components.overtimePay + components.kpiBonus + components.adjustmentAdditions,
          Deductions:
            components.attendanceDeduction +
            components.insuranceDeduction +
            components.benefitDeductions +
            components.adjustmentDeductions +
            components.pitTax,
          NetSalary: components.netSalary,
          CreatedAt: new Date(),
        });
      }

      const savedSalary = await this.salaryRepo.save(salary);
      await this.removeDuplicateSalaryRows(
        employee.EmployeeID, month, year, savedSalary.SalaryID,
      );

      totalNetSalary += components.netSalary;
      results.push({
        EmployeeID: employee.EmployeeID,
        FullName: employee.FullName,
        ...components,
      });
    }

    return {
      status: 'success',
      message: `Payroll calculated for ${employees.length} employees`,
      data: { month, year, totalEmployees: employees.length, totalNetSalary, records: results },
    };
  }

  async upsertManualPayroll(payload: UpsertPayrollDto) {
    await this.ensureSalaryConstraints();

    const employee = await this.employeesRepo.findOne({
      where: { EmployeeID: payload.employeeId },
    });

    if (!employee) {
      throw new NotFoundException(`Không tìm thấy nhân viên ${payload.employeeId}`);
    }

    if (!this.isActiveEmployee(employee)) {
      throw new BadRequestException('Nhân viên này không đủ điều kiện nhập lương.');
    }

    const existingRecord = await this.findSalaryByEmployeeAndPeriod(
      payload.employeeId, payload.month, payload.year,
    );

    const salaryMonth = new Date(Date.UTC(payload.year, payload.month - 1, 1));
    const salary =
      existingRecord ??
      this.salaryRepo.create({
        EmployeeID: payload.employeeId,
        SalaryMonth: salaryMonth,
      });

    await this.assignSalaryAmounts(salary, payload);

    const savedSalary = await this.salaryRepo.save(salary);
    await this.removeDuplicateSalaryRows(
      payload.employeeId, payload.month, payload.year, savedSalary.SalaryID,
    );

    return {
      status: 'success',
      message: existingRecord ? 'Cập nhật lương thành công' : 'Nhập lương thành công',
      data: await this.serializeSalary(savedSalary.SalaryID),
    };
  }

  async updatePayroll(salaryId: number, payload: UpdatePayrollDto) {
    await this.ensureSalaryConstraints();

    const salary = await this.salaryRepo.findOne({
      where: { SalaryID: salaryId },
    });

    if (!salary) {
      throw new NotFoundException(`Không tìm thấy bản ghi lương ${salaryId}`);
    }

    await this.assignSalaryAmounts(salary, payload);
    const savedSalary = await this.salaryRepo.save(salary);

    const salaryMonth = new Date(savedSalary.SalaryMonth);
    await this.removeDuplicateSalaryRows(
      savedSalary.EmployeeID,
      salaryMonth.getUTCMonth() + 1,
      salaryMonth.getUTCFullYear(),
      savedSalary.SalaryID,
    );

    return {
      status: 'success',
      message: 'Cập nhật lương thành công',
      data: await this.serializeSalary(savedSalary.SalaryID),
    };
  }

  // ─── Core payroll computation ────────────────────────────────────────────────

  /**
   * Tính toán đầy đủ các thành phần lương theo SRS.
   * Tách biệt hoàn toàn: base → gross → taxable → PIT → net
   */
  async computePayrollComponents(
    employeeId: number,
    month: number,
    year: number,
    baseSalary: number,
    periodDate?: Date,
  ): Promise<PayrollComponents> {
    const forDate = periodDate ?? new Date(Date.UTC(year, month - 1, 1));

    // Lấy policy đang active
    const activePolicy = await this.salaryPolicyRepo.findOne({
      where: { IsActive: true },
      order: { EffectiveDate: 'DESC', PolicyID: 'DESC' },
    });
    const overtimeRate = Number(activePolicy?.OvertimeRate ?? 1.5);

    // Tỷ lệ bảo hiểm nhân viên đóng từ policy (% trên lương cơ bản)
    const socialInsRate = Number(activePolicy?.SocialIns ?? 8) / 100;
    const healthInsRate = Number(activePolicy?.HealthIns ?? 1.5) / 100;
    const unemployInsRate = Number(activePolicy?.UnemployIns ?? 1) / 100;

    const hourlyBase =
      baseSalary > 0 ? baseSalary / STANDARD_WORK_DAYS_PER_MONTH / 8 : 0;

    // 1. Chấm công
    const attendance = await this.findAttendanceByEmployeeAndPeriod(
      employeeId, month, year,
    );
    const attendanceDeduction = this.computeAttendanceDeduction(
      baseSalary, attendance,
    );

    // 2. Tăng ca (Approved)
    const overtimeRows = await this.overtimeRepo
      .createQueryBuilder('ot')
      .where('ot.EmployeeID = :employeeId', { employeeId })
      .andWhere('MONTH(ot.OvertimeDate) = :month', { month })
      .andWhere('YEAR(ot.OvertimeDate) = :year', { year })
      .andWhere("ot.Status = 'Approved'")
      .getMany();
    const overtimeHours = overtimeRows.reduce(
      (sum, row) => sum + Number(row.Hours ?? 0), 0,
    );
    const overtimePay = Math.round(overtimeHours * hourlyBase * overtimeRate);

    // 3. KPI bonus (Approved KPIs trong kỳ)
    const kpiRows = await this.kpiRepo
      .createQueryBuilder('kpi')
      .where('kpi.EmployeeID = :employeeId', { employeeId })
      .andWhere("kpi.PeriodType = 'Monthly'")
      .andWhere(
        "(kpi.Period = :period OR (MONTH(kpi.CreatedAt) = :month AND YEAR(kpi.CreatedAt) = :year))",
        { period: `${year}-${String(month).padStart(2, '0')}`, month, year },
      )
      .andWhere("kpi.Status = 'Approved'")
      .getMany();
    const kpiBonus = kpiRows.reduce(
      (sum, row) => sum + Number(row.BonusAmount ?? 0), 0,
    );

    // 4. Lợi ích/bảo hiểm nhân viên đóng
    const benefits = await this.benefitsRepo.find({
      where: { EmployeeID: employeeId, Status: 'Active' },
    });
    const benefitDeductions = benefits.reduce(
      (sum, row) => sum + Number(row.EmployeeShare ?? 0), 0,
    );

    // 5. Điều chỉnh lương
    const adjustments = await this.adjustmentRepo
      .createQueryBuilder('adj')
      .where('adj.EmployeeID = :employeeId', { employeeId })
      .andWhere('MONTH(adj.SalaryMonth) = :month', { month })
      .andWhere('YEAR(adj.SalaryMonth) = :year', { year })
      .andWhere("adj.Status IN ('Approved', 'Applied')")
      .getMany();
    const adjustmentAdditions = adjustments
      .filter((r) => ['Bonus', 'Allowance', 'Commission'].includes(r.AdjustType))
      .reduce((sum, r) => sum + Number(r.Amount ?? 0), 0);
    const adjustmentDeductions = adjustments
      .filter((r) => r.AdjustType === 'Deduction')
      .reduce((sum, r) => sum + Number(r.Amount ?? 0), 0);

    // 6. Bảo hiểm xã hội (employee share theo tỷ lệ từ policy)
    const socialIns = Math.round(baseSalary * socialInsRate);
    const healthIns = Math.round(baseSalary * healthInsRate);
    const unemployIns = Math.round(baseSalary * unemployInsRate);
    const insuranceDeduction = socialIns + healthIns + unemployIns;

    // 7. Lương gộp (gross)
    const grossSalary = baseSalary + overtimePay + kpiBonus + adjustmentAdditions;

    // 8. Thu nhập tính thuế
    const taxableIncome = this.pitTaxService.computeTaxableIncome(
      grossSalary,
      0, // dependentCount — mặc định 0, có thể mở rộng sau
      socialIns,
      healthIns,
      unemployIns,
    );

    // 9. Thuế TNCN theo bậc lũy tiến
    const pitTax = await this.pitTaxService.calculatePIT(taxableIncome, forDate);

    // 10. Lương thực nhận
    const netSalary = Math.max(
      0,
      grossSalary -
        attendanceDeduction -
        insuranceDeduction -
        benefitDeductions -
        adjustmentDeductions -
        pitTax,
    );

    return {
      baseSalary,
      grossSalary,
      attendanceDeduction,
      overtimePay,
      kpiBonus,
      insuranceDeduction,
      benefitDeductions,
      adjustmentAdditions,
      adjustmentDeductions,
      taxableIncome,
      pitTax,
      netSalary,
    };
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  private isActiveEmployee(employee: EmployeesPayroll) {
    return isPayrollEligibleStatus(employee.Status);
  }

  private async assignSalaryAmounts(
    salary: Salary,
    payload: Pick<UpsertPayrollDto, 'baseSalary' | 'bonus' | 'deductions'>,
  ) {
    const baseSalary = Number(payload.baseSalary ?? 0);
    const manualBonus = Number(payload.bonus ?? 0);
    const manualDeductions = Number(payload.deductions ?? 0);

    salary.BaseSalary = baseSalary;
    const salaryMonth = new Date(salary.SalaryMonth);
    const month = salaryMonth.getUTCMonth() + 1;
    const year = salaryMonth.getUTCFullYear();

    // Tính đầy đủ components (kể cả PIT)
    const components = await this.computePayrollComponents(
      salary.EmployeeID, month, year, baseSalary, salaryMonth,
    );

    // Bonus field = overtime + kpi + adjustments + manual bonus
    salary.Bonus =
      components.overtimePay +
      components.kpiBonus +
      components.adjustmentAdditions +
      manualBonus;

    // Deductions field = attendance + insurance + benefits + adjustmentDeductions + PIT + manual
    salary.Deductions =
      components.attendanceDeduction +
      components.insuranceDeduction +
      components.benefitDeductions +
      components.adjustmentDeductions +
      components.pitTax +
      manualDeductions;

    salary.NetSalary = Math.max(0, baseSalary + salary.Bonus - salary.Deductions);
    salary.CreatedAt = new Date();
  }

  private async findSalaryByEmployeeAndPeriod(
    employeeId: number,
    month: number,
    year: number,
  ) {
    return this.salaryRepo
      .createQueryBuilder('salary')
      .where('salary.EmployeeID = :employeeId', { employeeId })
      .andWhere('MONTH(salary.SalaryMonth) = :month', { month })
      .andWhere('YEAR(salary.SalaryMonth) = :year', { year })
      .orderBy('salary.SalaryID', 'DESC')
      .getOne();
  }

  private computeAttendanceDeduction(
    baseSalary: number,
    attendance?: Attendance | null,
  ) {
    const absentDays = Number(attendance?.AbsentDays ?? 0);
    if (!baseSalary || absentDays <= 0) return 0;
    return Math.round((baseSalary / STANDARD_WORK_DAYS_PER_MONTH) * absentDays);
  }

  private async findAttendanceByEmployeeAndPeriod(
    employeeId: number,
    month: number,
    year: number,
  ) {
    return this.attendanceRepo
      .createQueryBuilder('attendance')
      .where('attendance.EmployeeID = :employeeId', { employeeId })
      .andWhere('MONTH(attendance.AttendanceMonth) = :month', { month })
      .andWhere('YEAR(attendance.AttendanceMonth) = :year', { year })
      .orderBy('attendance.AttendanceID', 'DESC')
      .getOne();
  }

  private async serializeSalaryRecord(record: Salary) {
    const salaryMonth = new Date(record.SalaryMonth);
    const month = salaryMonth.getUTCMonth() + 1;
    const year = salaryMonth.getUTCFullYear();
    const baseSalary = Number(record.BaseSalary ?? 0);

    const components = await this.computePayrollComponents(
      record.EmployeeID, month, year, baseSalary, salaryMonth,
    );

    return {
      SalaryID: record.SalaryID,
      EmployeeID: record.EmployeeID,
      FullName: record.employee?.FullName ?? null,
      SalaryMonth: record.SalaryMonth,
      // Stored amounts
      BaseSalary: record.BaseSalary,
      Bonus: record.Bonus,
      Deductions: record.Deductions,
      NetSalary: record.NetSalary,
      // Computed breakdown
      GrossSalary: components.grossSalary,
      AttendanceDeduction: components.attendanceDeduction,
      OvertimePay: components.overtimePay,
      KpiBonus: components.kpiBonus,
      InsuranceDeduction: components.insuranceDeduction,
      BenefitDeductions: components.benefitDeductions,
      PayrollAdjustments: components.adjustmentAdditions - components.adjustmentDeductions,
      TaxableIncome: components.taxableIncome,
      PitTax: components.pitTax,
      WorkDays: null as number | null,
      AbsentDays: null as number | null,
      LeaveDays: null as number | null,
      CreatedAt: record.CreatedAt,
    };
  }

  private async serializeSalary(salaryId: number) {
    const record = await this.salaryRepo.findOne({
      where: { SalaryID: salaryId },
      relations: ['employee'],
    });
    if (!record) return null;
    return this.serializeSalaryRecord(record);
  }

  private async removeDuplicateSalaryRows(
    employeeId: number,
    month: number,
    year: number,
    keepSalaryId: number,
  ) {
    await this.salaryRepo
      .createQueryBuilder()
      .delete()
      .from(Salary)
      .where('EmployeeID = :employeeId', { employeeId })
      .andWhere('MONTH(SalaryMonth) = :month', { month })
      .andWhere('YEAR(SalaryMonth) = :year', { year })
      .andWhere('SalaryID != :keepSalaryId', { keepSalaryId })
      .execute();
  }

  private async ensureSalaryConstraints(): Promise<void> {
    await this.salaryRepo.query(`
      DELETE FROM salaries
      WHERE SalaryID IN (
        SELECT SalaryID FROM (
          SELECT
            SalaryID,
            ROW_NUMBER() OVER (
              PARTITION BY EmployeeID, SalaryMonth
              ORDER BY SalaryID DESC
            ) AS row_num
          FROM salaries
        ) ranked
        WHERE ranked.row_num > 1
      )
    `);

    const uniqueIndexRows: Array<{ INDEX_NAME: string }> =
      await this.salaryRepo.query(`
        SELECT INDEX_NAME
        FROM information_schema.statistics
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'salaries'
          AND INDEX_NAME = 'ux_salaries_employee_month'
      `);

    if (uniqueIndexRows.length === 0) {
      await this.salaryRepo.query(`
        ALTER TABLE salaries
        ADD UNIQUE KEY ux_salaries_employee_month (EmployeeID, SalaryMonth)
      `);
    }
  }
}
