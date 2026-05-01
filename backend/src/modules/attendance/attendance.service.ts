import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from '../../database/payroll/entities/attendance.entity';

interface FindAllParams {
  employeeId?: number;
  month?: number;
  year?: number;
  page: number;
  limit: number;
}

interface SummaryParams {
  employeeId?: number;
  month?: number;
  year?: number;
}

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance, 'payrollConnection')
    private readonly attendanceRepo: Repository<Attendance>,
  ) {}

  /**
   * GET /api/v1/attendance
   * Join attendance + employees_payroll
   */
  async findAll(params: FindAllParams) {
    const { employeeId, month, year, page, limit } = params;
    const skip = (page - 1) * limit;

    const latestPerEmployeeMonth = this.attendanceRepo
      .createQueryBuilder('latest')
      .select('MAX(latest.AttendanceID)', 'AttendanceID')
      .groupBy('latest.EmployeeID')
      .addGroupBy('YEAR(latest.AttendanceMonth)')
      .addGroupBy('MONTH(latest.AttendanceMonth)');

    const qb = this.attendanceRepo
      .createQueryBuilder('a')
      .innerJoin(
        `(${latestPerEmployeeMonth.getQuery()})`,
        'latestAttendance',
        'latestAttendance.AttendanceID = a.AttendanceID',
      )
      .leftJoin('employees_payroll', 'e', 'e.EmployeeID = a.EmployeeID')
      .select('a.AttendanceID', 'AttendanceID')
      .addSelect('a.EmployeeID', 'EmployeeID')
      .addSelect('e.FullName', 'FullName')
      .addSelect('a.WorkDays', 'WorkDays')
      .addSelect('a.AbsentDays', 'AbsentDays')
      .addSelect('a.LeaveDays', 'LeaveDays')
      .addSelect('a.AttendanceMonth', 'AttendanceMonth')
      .orderBy('a.AttendanceMonth', 'DESC')
      .addOrderBy('a.EmployeeID', 'ASC')
      .skip(skip)
      .take(limit);

    if (employeeId) {
      qb.andWhere('a.EmployeeID = :employeeId', { employeeId });
    }
    if (month) {
      qb.andWhere('MONTH(a.AttendanceMonth) = :month', { month });
    }
    if (year) {
      qb.andWhere('YEAR(a.AttendanceMonth) = :year', { year });
    }

    const countQb = this.attendanceRepo
      .createQueryBuilder('a')
      .innerJoin(
        `(${latestPerEmployeeMonth.getQuery()})`,
        'latestAttendance',
        'latestAttendance.AttendanceID = a.AttendanceID',
      );

    if (employeeId) {
      countQb.andWhere('a.EmployeeID = :employeeId', { employeeId });
    }
    if (month) {
      countQb.andWhere('MONTH(a.AttendanceMonth) = :month', { month });
    }
    if (year) {
      countQb.andWhere('YEAR(a.AttendanceMonth) = :year', { year });
    }

    const [rows, total] = await Promise.all([qb.getRawMany(), countQb.getCount()]);

    const data = rows.map((row) => ({
      AttendanceID: Number(row.AttendanceID),
      EmployeeID: Number(row.EmployeeID),
      FullName: row.FullName ?? null,
      WorkDays: Number(row.WorkDays ?? 0),
      AbsentDays: Number(row.AbsentDays ?? 0),
      LeaveDays: Number(row.LeaveDays ?? 0),
      AttendanceMonth: row.AttendanceMonth,
    }));

    return {
      status: 'success',
      message: 'Attendance records fetched',
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * GET /api/v1/attendance/summary
   * Aggregated attendance summary per employee
   */
  async getSummary(params: SummaryParams) {
    const { employeeId, month, year } = params;

    const qb = this.attendanceRepo
      .createQueryBuilder('a')
      .leftJoin('employees_payroll', 'e', 'e.EmployeeID = a.EmployeeID')
      .select('a.EmployeeID', 'EmployeeID')
      .addSelect('e.FullName', 'FullName')
      .addSelect('SUM(COALESCE(a.WorkDays, 0))', 'WorkDays')
      .addSelect('SUM(COALESCE(a.AbsentDays, 0))', 'AbsentDays')
      .addSelect('SUM(COALESCE(a.LeaveDays, 0))', 'LeaveDays')
      .groupBy('a.EmployeeID')
      .addGroupBy('e.FullName');

    if (employeeId) {
      qb.where('a.EmployeeID = :employeeId', { employeeId });
    }
    if (month) {
      qb.andWhere('MONTH(a.AttendanceMonth) = :month', { month });
    }
    if (year) {
      qb.andWhere('YEAR(a.AttendanceMonth) = :year', { year });
    }

    const results = await qb.getRawMany();

    const data = results.map((row) => ({
      EmployeeID: row.EmployeeID,
      FullName: row.FullName,
      WorkDays: parseInt(row.WorkDays) || 0,
      AbsentDays: parseInt(row.AbsentDays) || 0,
      LeaveDays: parseInt(row.LeaveDays) || 0,
    }));

    return {
      status: 'success',
      message: 'Attendance summary fetched',
      data,
    };
  }
}
