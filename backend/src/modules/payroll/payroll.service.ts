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
import { isPayrollEligibleStatus } from '../../common/employee-status';
import { UpdatePayrollDto, UpsertPayrollDto } from './dto/manual-payroll.dto';

interface FindAllParams {
  employeeId?: number;
  month?: number;
  year?: number;
  status?: string;
  page: number;
  limit: number;
}

const STANDARD_WORK_DAYS_PER_MONTH = 26;

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
  ) {}

  async findAll(params: FindAllParams) {
    const { employeeId, month, year, page, limit } = params;
    const skip = (page - 1) * limit;

    // Subquery: lấy SalaryID lớn nhất (mới nhất) cho mỗi (EmployeeID, SalaryMonth)
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

    if (employeeId) {
      qb.andWhere('s.EmployeeID = :employeeId', { employeeId });
    }
    if (month) {
      qb.andWhere('MONTH(s.SalaryMonth) = :month', { month });
    }
    if (year) {
      qb.andWhere('YEAR(s.SalaryMonth) = :year', { year });
    }

    const [records, total] = await qb.getManyAndCount();

    const data = await Promise.all(
      records.map((record) => this.serializeSalaryRecord(record)),
    );

    return {
      status: 'success',
      message: 'Payroll records fetched',
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async calculate(month: number, year: number, employeeIds?: number[]) {
    await this.ensureSalaryConstraints();

    let employees = await this.employeesRepo.find();

    employees = employees.filter((employee) => this.isActiveEmployee(employee));

    if (employeeIds && employeeIds.length > 0) {
      const idSet = new Set(employeeIds);
      employees = employees.filter((employee) => idSet.has(employee.EmployeeID));
    }

    const results: Array<{
      EmployeeID: number;
      FullName: string;
      WorkDays: number | null;
      AbsentDays: number | null;
      LeaveDays: number | null;
      AttendanceDeduction: number;
      OvertimePay: number;
      BenefitDeductions: number;
      PayrollAdjustments: number;
      TaxDeduction: number;
      NetSalary: number;
    }> = [];
    let totalNetSalary = 0;

    for (const employee of employees) {
      const salaryMonth = new Date(Date.UTC(year, month - 1, 1));

      // Lấy bản ghi lương của đúng tháng đang tính (nếu có)
      // để giữ lại BaseSalary, Bonus, Deductions gốc của tháng đó.
      // Nếu chưa có thì lấy từ bản ghi mới nhất làm mặc định.
      const existingRecord = await this.salaryRepo
        .createQueryBuilder('salary')
        .where('salary.EmployeeID = :employeeId', {
          employeeId: employee.EmployeeID,
        })
        .andWhere('MONTH(salary.SalaryMonth) = :month', { month })
        .andWhere('YEAR(salary.SalaryMonth) = :year', { year })
        .orderBy('salary.SalaryID', 'DESC')
        .getOne();

      const fallbackSalary = await this.salaryRepo.findOne({
        where: { EmployeeID: employee.EmployeeID },
        order: { SalaryMonth: 'DESC', SalaryID: 'DESC' },
      });

      const source = existingRecord ?? fallbackSalary;

      const baseSalary = Number(source?.BaseSalary ?? 0);
      const bonus = Number(source?.Bonus ?? 0);
      const deductions = Number(source?.Deductions ?? 0);
      const attendance = await this.findAttendanceByEmployeeAndPeriod(
        employee.EmployeeID,
        month,
        year,
      );
      const attendanceDeduction = this.calculateAttendanceDeduction(
        baseSalary,
        attendance,
      );
      const policyInputs = await this.calculatePolicyInputs(
        employee.EmployeeID,
        month,
        year,
        baseSalary,
      );

      // NetSalary includes policy, benefit, overtime and adjustment inputs.
      const netSalary = this.calculateNetSalary(
        baseSalary,
        bonus + policyInputs.overtimePay + policyInputs.adjustmentAdditions,
        deductions +
          attendanceDeduction +
          policyInputs.benefitDeductions +
          policyInputs.adjustmentDeductions +
          policyInputs.taxDeduction,
      );

      let salary = existingRecord;

      if (salary) {
        Object.assign(salary, {
          BaseSalary: baseSalary,
          Bonus: bonus + policyInputs.overtimePay + policyInputs.adjustmentAdditions,
          Deductions:
            deductions +
            policyInputs.benefitDeductions +
            policyInputs.adjustmentDeductions +
            policyInputs.taxDeduction,
          NetSalary: netSalary,
          CreatedAt: new Date(),
        });
      } else {
        salary = this.salaryRepo.create({
          EmployeeID: employee.EmployeeID,
          SalaryMonth: salaryMonth,
          BaseSalary: baseSalary,
          Bonus: bonus,
          Deductions: deductions,
          NetSalary: netSalary,
          CreatedAt: new Date(),
        });
      }

      const savedSalary = await this.salaryRepo.save(salary);
      await this.removeDuplicateSalaryRows(
        employee.EmployeeID,
        month,
        year,
        savedSalary.SalaryID,
      );

      totalNetSalary += netSalary;
      results.push({
        EmployeeID: employee.EmployeeID,
        FullName: employee.FullName,
        WorkDays: attendance?.WorkDays ?? null,
        AbsentDays: attendance?.AbsentDays ?? null,
        LeaveDays: attendance?.LeaveDays ?? null,
        AttendanceDeduction: attendanceDeduction,
        OvertimePay: policyInputs.overtimePay,
        BenefitDeductions: policyInputs.benefitDeductions,
        PayrollAdjustments:
          policyInputs.adjustmentAdditions - policyInputs.adjustmentDeductions,
        TaxDeduction: policyInputs.taxDeduction,
        NetSalary: netSalary,
      });
    }

    return {
      status: 'success',
      message: `Payroll calculated for ${employees.length} employees`,
      data: {
        month,
        year,
        totalEmployees: employees.length,
        totalNetSalary,
        records: results,
      },
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
      payload.employeeId,
      payload.month,
      payload.year,
    );

    const salaryMonth = new Date(Date.UTC(payload.year, payload.month - 1, 1));
    const salary = existingRecord ?? this.salaryRepo.create({
      EmployeeID: payload.employeeId,
      SalaryMonth: salaryMonth,
    });

    await this.assignSalaryAmounts(salary, payload);

    const savedSalary = await this.salaryRepo.save(salary);
    await this.removeDuplicateSalaryRows(
      payload.employeeId,
      payload.month,
      payload.year,
      savedSalary.SalaryID,
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

  private isActiveEmployee(employee: EmployeesPayroll) {
    return isPayrollEligibleStatus(employee.Status);
  }

  private async assignSalaryAmounts(
    salary: Salary,
    payload: Pick<UpsertPayrollDto, 'baseSalary' | 'bonus' | 'deductions'>,
  ) {
    const baseSalary = Number(payload.baseSalary ?? 0);
    const bonus = Number(payload.bonus ?? 0);
    const deductions = Number(payload.deductions ?? 0);

    salary.BaseSalary = baseSalary;
    salary.Bonus = bonus;
    salary.Deductions = deductions;
    const salaryMonth = new Date(salary.SalaryMonth);
    const attendance = await this.findAttendanceByEmployeeAndPeriod(
      salary.EmployeeID,
      salaryMonth.getUTCMonth() + 1,
      salaryMonth.getUTCFullYear(),
    );
    const attendanceDeduction = this.calculateAttendanceDeduction(
      baseSalary,
      attendance,
    );

    salary.NetSalary = this.calculateNetSalary(
      baseSalary,
      bonus,
      deductions + attendanceDeduction,
    );
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

  private calculateNetSalary(
    baseSalary: number,
    bonus: number,
    deductions: number,
  ) {
    return Math.max(0, baseSalary + bonus - deductions);
  }

  private async calculatePolicyInputs(
    employeeId: number,
    month: number,
    year: number,
    baseSalary: number,
  ) {
    const activePolicy = await this.salaryPolicyRepo.findOne({
      where: { IsActive: true },
      order: { EffectiveDate: 'DESC', PolicyID: 'DESC' },
    });
    const overtimeRate = Number(activePolicy?.OvertimeRate ?? 1.5);
    const taxRate = Number(activePolicy?.TaxRate ?? 0);
    const hourlyBase = baseSalary > 0 ? baseSalary / STANDARD_WORK_DAYS_PER_MONTH / 8 : 0;

    const overtimeRows = await this.overtimeRepo
      .createQueryBuilder('ot')
      .where('ot.EmployeeID = :employeeId', { employeeId })
      .andWhere('MONTH(ot.OvertimeDate) = :month', { month })
      .andWhere('YEAR(ot.OvertimeDate) = :year', { year })
      .andWhere("ot.Status = 'Approved'")
      .getMany();
    const overtimeHours = overtimeRows.reduce((sum, row) => sum + Number(row.Hours ?? 0), 0);
    const overtimePay = Math.round(overtimeHours * hourlyBase * overtimeRate);

    const benefits = await this.benefitsRepo.find({
      where: { EmployeeID: employeeId, Status: 'Active' },
    });
    const benefitDeductions = benefits.reduce(
      (sum, row) => sum + Number(row.EmployeeShare ?? 0),
      0,
    );

    const adjustments = await this.adjustmentRepo
      .createQueryBuilder('adjustment')
      .where('adjustment.EmployeeID = :employeeId', { employeeId })
      .andWhere('MONTH(adjustment.SalaryMonth) = :month', { month })
      .andWhere('YEAR(adjustment.SalaryMonth) = :year', { year })
      .andWhere("adjustment.Status IN ('Approved', 'Applied')")
      .getMany();
    const adjustmentAdditions = adjustments
      .filter((row) => ['Bonus', 'Allowance', 'Commission'].includes(row.AdjustType))
      .reduce((sum, row) => sum + Number(row.Amount ?? 0), 0);
    const adjustmentDeductions = adjustments
      .filter((row) => row.AdjustType === 'Deduction')
      .reduce((sum, row) => sum + Number(row.Amount ?? 0), 0);
    const taxDeduction = Math.round((baseSalary * taxRate) / 100);

    return {
      overtimePay,
      benefitDeductions,
      adjustmentAdditions,
      adjustmentDeductions,
      taxDeduction,
    };
  }

  private calculateAttendanceDeduction(
    baseSalary: number,
    attendance?: Attendance | null,
  ) {
    const absentDays = Number(attendance?.AbsentDays ?? 0);

    if (!baseSalary || absentDays <= 0) {
      return 0;
    }

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
    const attendance = await this.findAttendanceByEmployeeAndPeriod(
      record.EmployeeID,
      month,
      year,
    );
    const attendanceDeduction = this.calculateAttendanceDeduction(
      baseSalary,
      attendance,
    );
    const policyInputs = await this.calculatePolicyInputs(
      record.EmployeeID,
      month,
      year,
      baseSalary,
    );

    return {
      SalaryID: record.SalaryID,
      EmployeeID: record.EmployeeID,
      FullName: record.employee?.FullName ?? null,
      SalaryMonth: record.SalaryMonth,
      BaseSalary: record.BaseSalary,
      Bonus: record.Bonus,
      Deductions: record.Deductions,
      AttendanceDeduction: attendanceDeduction,
      OvertimePay: policyInputs.overtimePay,
      BenefitDeductions: policyInputs.benefitDeductions,
      PayrollAdjustments:
        policyInputs.adjustmentAdditions - policyInputs.adjustmentDeductions,
      TaxDeduction: policyInputs.taxDeduction,
      WorkDays: attendance?.WorkDays ?? null,
      AbsentDays: attendance?.AbsentDays ?? null,
      LeaveDays: attendance?.LeaveDays ?? null,
      NetSalary: record.NetSalary,
      CreatedAt: record.CreatedAt,
    };
  }

  private async serializeSalary(salaryId: number) {
    const record = await this.salaryRepo.findOne({
      where: { SalaryID: salaryId },
      relations: ['employee'],
    });

    if (!record) {
      return null;
    }

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
