import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from '../../database/payroll/entities/attendance.entity';
import { AuditLog } from '../../database/payroll/entities/audit-log.entity';
import { EmployeesPayroll } from '../../database/payroll/entities/employees-payroll.entity';
import { Salary } from '../../database/payroll/entities/salaries.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Attendance, 'payrollConnection')
    private readonly attendanceRepo: Repository<Attendance>,
    @InjectRepository(Salary, 'payrollConnection')
    private readonly salaryRepo: Repository<Salary>,
    @InjectRepository(AuditLog, 'payrollConnection')
    private readonly auditRepo: Repository<AuditLog>,
    @InjectRepository(EmployeesPayroll, 'payrollConnection')
    private readonly employeeRepo: Repository<EmployeesPayroll>,
  ) {}

  async exportAttendanceCsv(month: number, year: number) {
    const rows = await this.attendanceRepo
      .createQueryBuilder('a')
      .leftJoin('employees_payroll', 'e', 'e.EmployeeID = a.EmployeeID')
      .select(['a.EmployeeID AS EmployeeID', 'e.FullName AS FullName', 'a.WorkDays AS WorkDays', 'a.AbsentDays AS AbsentDays', 'a.LeaveDays AS LeaveDays', 'a.OvertimeHours AS OvertimeHours', 'a.AttendanceMonth AS AttendanceMonth'])
      .where('MONTH(a.AttendanceMonth) = :month', { month })
      .andWhere('YEAR(a.AttendanceMonth) = :year', { year })
      .getRawMany();
    return this.toCsv(rows);
  }

  async exportPayrollCsv(month: number, year: number) {
    const rows = await this.salaryRepo
      .createQueryBuilder('s')
      .leftJoin('employees_payroll', 'e', 'e.EmployeeID = s.EmployeeID')
      .select(['s.EmployeeID AS EmployeeID', 'e.FullName AS FullName', 's.BaseSalary AS BaseSalary', 's.Bonus AS Bonus', 's.Deductions AS Deductions', 's.NetSalary AS NetSalary', 's.SalaryMonth AS SalaryMonth'])
      .where('MONTH(s.SalaryMonth) = :month', { month })
      .andWhere('YEAR(s.SalaryMonth) = :year', { year })
      .getRawMany();
    return this.toCsv(rows);
  }

  async exportAuditLogCsv(from?: string, to?: string) {
    const qb = this.auditRepo.createQueryBuilder('log').orderBy('log.CreatedAt', 'DESC');
    if (from) qb.andWhere('log.CreatedAt >= :from', { from });
    if (to) qb.andWhere('log.CreatedAt <= :to', { to });
    const rows = await qb.getMany();
    return this.toCsv(rows.map((row) => ({ ...row })));
  }

  async getSalaryByDepartment(month: number, year: number) {
    const data = await this.salaryRepo
      .createQueryBuilder('s')
      .leftJoin('employees_payroll', 'e', 'e.EmployeeID = s.EmployeeID')
      .leftJoin('departments_payroll', 'd', 'd.DepartmentID = e.DepartmentID')
      .select('e.DepartmentID', 'DepartmentID')
      .addSelect('d.DepartmentName', 'DepartmentName')
      .addSelect('COUNT(s.SalaryID)', 'EmployeeCount')
      .addSelect('SUM(COALESCE(s.NetSalary, 0))', 'TotalNetSalary')
      .where('MONTH(s.SalaryMonth) = :month', { month })
      .andWhere('YEAR(s.SalaryMonth) = :year', { year })
      .groupBy('e.DepartmentID')
      .addGroupBy('d.DepartmentName')
      .getRawMany();
    return { status: 'success', data };
  }

  async getEmployeeDistribution() {
    const data = await this.employeeRepo
      .createQueryBuilder('e')
      .leftJoin('departments_payroll', 'd', 'd.DepartmentID = e.DepartmentID')
      .select('e.DepartmentID', 'DepartmentID')
      .addSelect('d.DepartmentName', 'DepartmentName')
      .addSelect('e.Status', 'Status')
      .addSelect('COUNT(e.EmployeeID)', 'EmployeeCount')
      .groupBy('e.DepartmentID')
      .addGroupBy('d.DepartmentName')
      .addGroupBy('e.Status')
      .getRawMany();
    return { status: 'success', data };
  }

  async getPayrollTrend(months: number) {
    const data = await this.salaryRepo
      .createQueryBuilder('s')
      .select("DATE_FORMAT(s.SalaryMonth, '%Y-%m-01')", 'Period')
      .addSelect('COUNT(s.SalaryID)', 'EmployeeCount')
      .addSelect('SUM(COALESCE(s.NetSalary, 0))', 'TotalNetSalary')
      .where('s.SalaryMonth >= DATE_SUB(CURDATE(), INTERVAL :months MONTH)', { months })
      .groupBy("DATE_FORMAT(s.SalaryMonth, '%Y-%m-01')")
      .orderBy('Period', 'ASC')
      .getRawMany();
    return { status: 'success', data };
  }

  private toCsv(rows: Array<Record<string, unknown>>) {
    if (rows.length === 0) return '';
    const headers = Object.keys(rows[0]);
    const lines = [
      headers.join(','),
      ...rows.map((row) => headers.map((header) => this.csvCell(row[header])).join(',')),
    ];
    return lines.join('\n');
  }

  private csvCell(value: unknown) {
    if (value === null || value === undefined) return '';
    const text = value instanceof Date ? value.toISOString() : String(value);
    return `"${text.replace(/"/g, '""')}"`;
  }
}
