import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alert } from '../../database/payroll/entities/alert.entity';
import { Attendance } from '../../database/payroll/entities/attendance.entity';
import { EmployeesPayroll } from '../../database/payroll/entities/employees-payroll.entity';
import { Salary } from '../../database/payroll/entities/salaries.entity';

@Injectable()
export class AlertsService {
  constructor(
    @InjectRepository(Alert, 'payrollConnection')
    private readonly alertRepo: Repository<Alert>,
    @InjectRepository(EmployeesPayroll, 'payrollConnection')
    private readonly employeeRepo: Repository<EmployeesPayroll>,
    @InjectRepository(Attendance, 'payrollConnection')
    private readonly attendanceRepo: Repository<Attendance>,
    @InjectRepository(Salary, 'payrollConnection')
    private readonly salaryRepo: Repository<Salary>,
  ) {}

  async findAll(query: { type?: string; unread?: string; page?: number; limit?: number }) {
    const page = Math.max(Number(query.page ?? 1), 1);
    const limit = Math.min(Math.max(Number(query.limit ?? 20), 1), 100);
    const qb = this.alertRepo
      .createQueryBuilder('alert')
      .where('alert.IsActive = 1')
      .orderBy('alert.CreatedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.type) qb.andWhere('alert.AlertType = :type', { type: query.type });
    if (query.unread === 'true') qb.andWhere('alert.IsRead = 0');

    const [data, total] = await qb.getManyAndCount();
    return { status: 'success', data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async markRead(id: number) {
    const alert = await this.alertRepo.findOne({ where: { AlertID: id } });
    if (!alert) throw new NotFoundException('KhÃ´ng tÃ¬m tháº¥y cáº£nh bÃ¡o');
    alert.IsRead = true;
    return { status: 'success', data: await this.alertRepo.save(alert) };
  }

  async generateBirthdayAlerts() {
    if (!(await this.hasEmployeeColumn('DateOfBirth'))) {
      return { status: 'success', data: { created: 0, alerts: [] } };
    }

    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const employees = await this.employeeRepo
      .createQueryBuilder('employee')
      .where('employee.Status = :status', { status: 'Active' })
      .andWhere('employee.DateOfBirth IS NOT NULL')
      .andWhere('MONTH(employee.DateOfBirth) = :month', { month })
      .andWhere('DAY(employee.DateOfBirth) = :day', { day })
      .getMany();

    return this.createAlertsOnce(
      employees.map((employee) => ({
        AlertType: 'BIRTHDAY',
        EmployeeID: employee.EmployeeID,
        Title: `Sinh nháº­t ${employee.FullName}`,
        Message: `HÃ´m nay lÃ  sinh nháº­t cá»§a ${employee.FullName}`,
        TriggerDate: today,
      })),
    );
  }

  async generateAbsenceAlerts(month: number, year: number) {
    const rows = await this.attendanceRepo
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.employee', 'employee')
      .where('MONTH(attendance.AttendanceMonth) = :month', { month })
      .andWhere('YEAR(attendance.AttendanceMonth) = :year', { year })
      .andWhere('attendance.AbsentDays >= 3')
      .getMany();

    return this.createAlertsOnce(
      rows.map((row) => ({
        AlertType: 'ABSENCE',
        EmployeeID: row.EmployeeID,
        Title: `Váº¯ng nhiá»u ngÃ y`,
        Message: `${row.employee?.FullName ?? `NV ${row.EmployeeID}`} váº¯ng ${row.AbsentDays} ngÃ y trong ${month}/${year}`,
        TriggerDate: new Date(Date.UTC(year, month - 1, 1)),
      })),
    );
  }

  async generateAnniversaryAlerts() {
    if (!(await this.hasEmployeeColumn('HireDate'))) {
      return { status: 'success', data: { created: 0, alerts: [] } };
    }

    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const employees = await this.employeeRepo
      .createQueryBuilder('employee')
      .select('employee.EmployeeID', 'EmployeeID')
      .addSelect('employee.FullName', 'FullName')
      .addSelect('employee.HireDate', 'HireDate')
      .where('employee.Status = :status', { status: 'Active' })
      .andWhere('employee.HireDate IS NOT NULL')
      .andWhere('MONTH(employee.HireDate) = :month', { month })
      .andWhere('DAY(employee.HireDate) = :day', { day })
      .getRawMany<{
        EmployeeID: number;
        FullName: string;
        HireDate: Date;
      }>();

    return this.createAlertsOnce(
      employees.map((employee) => {
        const hireDate = new Date(employee.HireDate);
        const years = today.getFullYear() - hireDate.getFullYear();
        return {
          AlertType: 'WORK_ANNIVERSARY',
          EmployeeID: employee.EmployeeID,
          Title: `Kỷ niệm làm việc ${employee.FullName}`,
          Message: `${employee.FullName} tròn ${years} năm làm việc`,
          TriggerDate: today,
        };
      }),
    );
  }

  async generateLeaveOveruseAlerts(month: number, year: number, maxLeaveDays = 2) {
    const rows = await this.attendanceRepo
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.employee', 'employee')
      .where('MONTH(attendance.AttendanceMonth) = :month', { month })
      .andWhere('YEAR(attendance.AttendanceMonth) = :year', { year })
      .andWhere('attendance.LeaveDays > :maxLeaveDays', { maxLeaveDays })
      .getMany();

    return this.createAlertsOnce(
      rows.map((row) => ({
        AlertType: 'LEAVE_OVERUSE',
        EmployeeID: row.EmployeeID,
        Title: 'Nghỉ phép vượt ngưỡng',
        Message: `${row.employee?.FullName ?? `NV ${row.EmployeeID}`} nghỉ ${row.LeaveDays} ngày trong ${month}/${year}`,
        TriggerDate: new Date(Date.UTC(year, month - 1, 1)),
      })),
    );
  }

  async generatePayrollAnomalyAlerts(month: number, year: number) {
    const current = await this.salaryRepo
      .createQueryBuilder('salary')
      .where('MONTH(salary.SalaryMonth) = :month', { month })
      .andWhere('YEAR(salary.SalaryMonth) = :year', { year })
      .getMany();

    const alerts: Partial<Alert>[] = [];
    for (const salary of current) {
      const previous = await this.salaryRepo
        .createQueryBuilder('salary')
        .where('salary.EmployeeID = :employeeId', { employeeId: salary.EmployeeID })
        .andWhere('salary.SalaryMonth < :salaryMonth', { salaryMonth: salary.SalaryMonth })
        .orderBy('salary.SalaryMonth', 'DESC')
        .addOrderBy('salary.SalaryID', 'DESC')
        .getOne();

      const prevNet = Number(previous?.NetSalary ?? 0);
      const currNet = Number(salary.NetSalary ?? 0);
      if (prevNet > 0 && Math.abs(currNet - prevNet) / prevNet > 0.3) {
        alerts.push({
          AlertType: 'PAYROLL_ANOMALY',
          EmployeeID: salary.EmployeeID,
          Title: 'LÆ°Æ¡ng biáº¿n Ä‘á»™ng báº¥t thÆ°á»ng',
          Message: `NetSalary thay Ä‘á»•i trÃªn 30% so vá»›i tháº¡ng trÆ°á»›c`,
          TriggerDate: new Date(Date.UTC(year, month - 1, 1)),
        });
      }
    }

    return this.createAlertsOnce(alerts);
  }

  private async createAlertsOnce(alerts: Partial<Alert>[]) {
    const created: Alert[] = [];
    for (const payload of alerts) {
      const exists = await this.alertRepo.findOne({
        where: {
          AlertType: payload.AlertType,
          EmployeeID: payload.EmployeeID,
          TriggerDate: payload.TriggerDate,
        },
      });
      if (!exists) {
        created.push(await this.alertRepo.save(this.alertRepo.create(payload)));
      }
    }
    return { status: 'success', data: { created: created.length, alerts: created } };
  }

  private async hasEmployeeColumn(columnName: string) {
    const rows: Array<{ COLUMN_NAME: string }> = await this.employeeRepo.query(
      `
        SELECT COLUMN_NAME
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = 'employees_payroll'
          AND column_name = ?
      `,
      [columnName],
    );

    return rows.length > 0;
  }
}
