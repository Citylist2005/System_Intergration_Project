import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ok } from '../../common/api-response';
import { Attendance } from '../../database/payroll/entities/attendance.entity';
import { AuditActor, AuditService } from '../audit/audit.service';

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
    private readonly auditService: AuditService,
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
      .addSelect('a.OvertimeHours', 'OvertimeHours')
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
      OvertimeHours: Number(row.OvertimeHours ?? 0),
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
      .addSelect('SUM(COALESCE(a.OvertimeHours, 0))', 'OvertimeHours')
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
      OvertimeHours: Number(row.OvertimeHours ?? 0),
    }));

    return {
      status: 'success',
      message: 'Attendance summary fetched',
      data,
    };
  }

  async upsertManual(
    payload: {
      employeeId: number;
      month: number;
      year: number;
      workDays: number;
      absentDays: number;
      leaveDays: number;
      overtimeHours?: number;
    },
    actor?: AuditActor,
    ipAddress?: string,
  ) {
    const attendanceMonth = new Date(Date.UTC(payload.year, payload.month - 1, 1));
    let record = await this.attendanceRepo
      .createQueryBuilder('attendance')
      .where('attendance.EmployeeID = :employeeId', { employeeId: payload.employeeId })
      .andWhere('MONTH(attendance.AttendanceMonth) = :month', { month: payload.month })
      .andWhere('YEAR(attendance.AttendanceMonth) = :year', { year: payload.year })
      .orderBy('attendance.AttendanceID', 'DESC')
      .getOne();
    const before = record ? { ...record } : null;

    record =
      record ??
      this.attendanceRepo.create({
        EmployeeID: payload.employeeId,
        AttendanceMonth: attendanceMonth,
      });

    record.WorkDays = Number(payload.workDays ?? 0);
    record.AbsentDays = Number(payload.absentDays ?? 0);
    record.LeaveDays = Number(payload.leaveDays ?? 0);
    record.OvertimeHours = Number(payload.overtimeHours ?? 0);
    record.CreatedAt = new Date();

    const saved = await this.attendanceRepo.save(record);
    await this.auditService.write({
      actor,
      action: before ? 'UPDATE' : 'CREATE',
      entityType: 'Attendance',
      entityId: saved.AttendanceID,
      oldValues: before,
      newValues: saved,
      ipAddress,
    });

    return ok('Đã lưu dữ liệu công thủ công', saved);
  }

  async updateManual(
    id: number,
    payload: {
      workDays: number;
      absentDays: number;
      leaveDays: number;
      overtimeHours?: number;
    },
    actor?: AuditActor,
    ipAddress?: string,
  ) {
    const record = await this.attendanceRepo.findOne({ where: { AttendanceID: id } });
    if (!record) {
      throw new NotFoundException(`Không tìm thấy bản ghi công ${id}`);
    }

    const before = { ...record };
    record.WorkDays = Number(payload.workDays ?? record.WorkDays ?? 0);
    record.AbsentDays = Number(payload.absentDays ?? record.AbsentDays ?? 0);
    record.LeaveDays = Number(payload.leaveDays ?? record.LeaveDays ?? 0);
    record.OvertimeHours = Number(payload.overtimeHours ?? record.OvertimeHours ?? 0);
    record.CreatedAt = new Date();

    const saved = await this.attendanceRepo.save(record);
    await this.auditService.write({
      actor,
      action: 'UPDATE',
      entityType: 'Attendance',
      entityId: saved.AttendanceID,
      oldValues: before,
      newValues: saved,
      ipAddress,
    });

    return ok('Đã cập nhật dữ liệu công', saved);
  }
}
