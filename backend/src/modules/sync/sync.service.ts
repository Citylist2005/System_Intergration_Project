import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Not, Repository } from 'typeorm';
import { DatabaseConnectionsService } from '../../config/database-connections.service';
import { HumanEmployee } from '../../database/human/entities/employee.entity';
import { HumanDepartment } from '../../database/human/entities/department.entity';
import { HumanPosition } from '../../database/human/entities/position.entity';
import { EmployeesPayroll } from '../../database/payroll/entities/employees-payroll.entity';
import { PayrollDepartment } from '../../database/payroll/entities/departments-payroll.entity';
import { PayrollPosition } from '../../database/payroll/entities/positions-payroll.entity';
import { Attendance } from '../../database/payroll/entities/attendance.entity';
import { SyncStatus } from '../../database/payroll/entities/sync-status.entity';
import { normalizeEmployeeStatus } from '../../common/employee-status';

interface SyncResult {
  entity: string;
  totalRecords: number;
  created: number;
  updated: number;
  failed: number;
  errors: string[];
  targetRecords?: number;
}

export interface SyncResponse {
  status: 'success' | 'failed' | 'partial_failed';
  message: string;
  data?: Record<string, unknown>;
  errorCode?: number;
}

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);
  private lastSyncResult: Record<string, unknown> | null = null;

  constructor(
    private readonly databaseConnectionsService: DatabaseConnectionsService,

    @InjectDataSource('humanConnection')
    private readonly humanDataSource: DataSource,

    @InjectRepository(HumanEmployee, 'humanConnection')
    private readonly humanEmployeeRepo: Repository<HumanEmployee>,

    @InjectRepository(HumanDepartment, 'humanConnection')
    private readonly humanDepartmentRepo: Repository<HumanDepartment>,

    @InjectRepository(HumanPosition, 'humanConnection')
    private readonly humanPositionRepo: Repository<HumanPosition>,

    @InjectRepository(EmployeesPayroll, 'payrollConnection')
    private readonly payrollEmployeeRepo: Repository<EmployeesPayroll>,

    @InjectRepository(PayrollDepartment, 'payrollConnection')
    private readonly payrollDepartmentRepo: Repository<PayrollDepartment>,

    @InjectRepository(PayrollPosition, 'payrollConnection')
    private readonly payrollPositionRepo: Repository<PayrollPosition>,

    @InjectRepository(Attendance, 'payrollConnection')
    private readonly payrollAttendanceRepo: Repository<Attendance>,

    @InjectRepository(SyncStatus, 'payrollConnection')
    private readonly syncStatusRepo: Repository<SyncStatus>,
  ) {}

  async testHumanConnection() {
    try {
      const rows = await this.databaseConnectionsService.testHumanConnection();

      return {
        status: 'success',
        message: 'humanConnection connected successfully',
        data: rows,
        connections: this.databaseConnectionsService.getConnectionStatuses(),
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown SQL Server error';

      throw new ServiceUnavailableException({
        status: 'failed',
        message: `humanConnection failed: ${message}`,
        connections: this.databaseConnectionsService.getConnectionStatuses(),
      });
    }
  }

  async syncEmployees(): Promise<SyncResponse> {
    const startedAt = new Date();
    const result: SyncResult = {
      entity: 'EMPLOYEE',
      totalRecords: 0,
      created: 0,
      updated: 0,
      failed: 0,
      errors: [],
    };

    try {
      const humanEmployees = await this.humanEmployeeRepo.find();
      result.totalRecords = humanEmployees.length;
      const sourceEmployeeIds = humanEmployees.map((employee) => employee.EmployeeID);

      for (const source of humanEmployees) {
        try {
          const existing = await this.payrollEmployeeRepo.findOne({
            where: { EmployeeID: source.EmployeeID },
          });

          const mapped: Partial<EmployeesPayroll> = {
            EmployeeID: source.EmployeeID,
            FullName: source.FullName,
            DepartmentID: source.DepartmentID,
            PositionID: source.PositionID,
            Status: normalizeEmployeeStatus(source.Status),
            SyncedAt: new Date(),
          };

          if (existing) {
            await this.payrollEmployeeRepo.update(
              { EmployeeID: source.EmployeeID },
              mapped,
            );
            result.updated++;
          } else {
            await this.payrollEmployeeRepo.save(
              this.payrollEmployeeRepo.create(mapped),
            );
            result.created++;
          }
        } catch (error) {
          result.failed++;
          result.errors.push(
            `Employee ${source.EmployeeID}: ${(error as Error).message}`,
          );
        }
      }

      if (sourceEmployeeIds.length > 0) {
        const deactivateResult = await this.payrollEmployeeRepo
          .createQueryBuilder()
          .update(EmployeesPayroll)
          .set({ Status: 'Inactive', SyncedAt: new Date() })
          .where('EmployeeID NOT IN (:...sourceEmployeeIds)', {
            sourceEmployeeIds,
          })
          .andWhere('Status != :inactiveStatus', {
            inactiveStatus: 'Inactive',
          })
          .execute();

        result.updated += deactivateResult.affected ?? 0;
      }

      result.targetRecords = await this.payrollEmployeeRepo.count({
        where: { Status: Not('Inactive') },
      });

      return this.buildSyncResponse(
        'Đồng bộ nhân viên hoàn tất',
        startedAt,
        result,
      );
    } catch (error) {
      return this.buildTopLevelFailure(
        `Đồng bộ nhân viên thất bại: ${(error as Error).message}`,
        startedAt,
        result,
      );
    }
  }

  async syncDepartments(): Promise<SyncResponse> {
    const startedAt = new Date();
    const result: SyncResult = {
      entity: 'DEPARTMENT',
      totalRecords: 0,
      created: 0,
      updated: 0,
      failed: 0,
      errors: [],
    };

    try {
      const humanDepartments = await this.humanDepartmentRepo.find();
      result.totalRecords = humanDepartments.length;

      for (const source of humanDepartments) {
        try {
          const existing = await this.payrollDepartmentRepo.findOne({
            where: { DepartmentID: source.DepartmentID },
          });

          const mapped: Partial<PayrollDepartment> = {
            DepartmentID: source.DepartmentID,
            DepartmentName: source.DepartmentName,
            SyncedAt: new Date(),
          };

          if (existing) {
            await this.payrollDepartmentRepo.update(
              { DepartmentID: source.DepartmentID },
              mapped,
            );
            result.updated++;
          } else {
            await this.payrollDepartmentRepo.save(
              this.payrollDepartmentRepo.create(mapped),
            );
            result.created++;
          }
        } catch (error) {
          result.failed++;
          result.errors.push(
            `Department ${source.DepartmentID}: ${(error as Error).message}`,
          );
        }
      }

      return this.buildSyncResponse(
        'Đồng bộ phòng ban hoàn tất',
        startedAt,
        result,
      );
    } catch (error) {
      return this.buildTopLevelFailure(
        `Đồng bộ phòng ban thất bại: ${(error as Error).message}`,
        startedAt,
        result,
      );
    }
  }

  async syncPositions(): Promise<SyncResponse> {
    const startedAt = new Date();
    const result: SyncResult = {
      entity: 'POSITION',
      totalRecords: 0,
      created: 0,
      updated: 0,
      failed: 0,
      errors: [],
    };

    try {
      const humanPositions = await this.humanPositionRepo.find();
      result.totalRecords = humanPositions.length;

      for (const source of humanPositions) {
        try {
          const existing = await this.payrollPositionRepo.findOne({
            where: { PositionID: source.PositionID },
          });

          const mapped: Partial<PayrollPosition> = {
            PositionID: source.PositionID,
            PositionName: source.PositionName,
            SyncedAt: new Date(),
          };

          if (existing) {
            await this.payrollPositionRepo.update(
              { PositionID: source.PositionID },
              mapped,
            );
            result.updated++;
          } else {
            await this.payrollPositionRepo.save(
              this.payrollPositionRepo.create(mapped),
            );
            result.created++;
          }
        } catch (error) {
          result.failed++;
          result.errors.push(
            `Position ${source.PositionID}: ${(error as Error).message}`,
          );
        }
      }

      return this.buildSyncResponse(
        'Đồng bộ chức vụ hoàn tất',
        startedAt,
        result,
      );
    } catch (error) {
      return this.buildTopLevelFailure(
        `Đồng bộ chức vụ thất bại: ${(error as Error).message}`,
        startedAt,
        result,
      );
    }
  }

  async syncAttendance(month?: number, year?: number): Promise<SyncResponse> {
    const startedAt = new Date();
    const result: SyncResult = {
      entity: 'ATTENDANCE',
      totalRecords: 0,
      created: 0,
      updated: 0,
      failed: 0,
      errors: [],
    };

    try {
      await this.databaseConnectionsService.ensureHumanConnection();

      const tableName = await this.findHumanAttendanceTable();
      if (!tableName) {
        return this.buildTopLevelFailure(
          'Đồng bộ chấm công thất bại: không tìm thấy bảng Attendance/Attendances trong HUMAN_2025.',
          startedAt,
          result,
        );
      }

      const availableColumns = await this.getHumanTableColumns(tableName);
      const requiredColumns = [
        'EmployeeID',
        'WorkDays',
        'AbsentDays',
        'LeaveDays',
        'AttendanceMonth',
      ];
      const missingColumns = requiredColumns.filter(
        (column) => !availableColumns.includes(column),
      );

      if (missingColumns.length > 0) {
        return this.buildTopLevelFailure(
          `Đồng bộ chấm công thất bại: bảng nguồn ${tableName} thiếu cột ${missingColumns.join(', ')}.`,
          startedAt,
          result,
        );
      }

      const rows = await this.humanDataSource.query(
        `SELECT EmployeeID, WorkDays, AbsentDays, LeaveDays, CONVERT(varchar(10), AttendanceMonth, 23) AS AttendanceMonth FROM [dbo].[${tableName}]`,
      );

      const filteredRows = rows.filter((row: Record<string, unknown>) => {
        if (!month && !year) {
          return true;
        }

        const attendanceMonth = new Date(String(row.AttendanceMonth));
        const matchesMonth =
          !month || attendanceMonth.getUTCMonth() + 1 === month;
        const matchesYear = !year || attendanceMonth.getUTCFullYear() === year;

        return matchesMonth && matchesYear;
      });

      const normalizedRows = filteredRows.map((row: Record<string, unknown>) => ({
        EmployeeID: Number(row.EmployeeID),
        WorkDays: Number(row.WorkDays ?? 0),
        AbsentDays: Number(row.AbsentDays ?? 0),
        LeaveDays: Number(row.LeaveDays ?? 0),
        AttendanceMonth: this.normalizeAttendanceDate(row.AttendanceMonth),
      }));

      result.totalRecords = normalizedRows.length;

      await this.cleanupAttendanceRowsForMonthlySnapshots();
      await this.cleanupAttendanceRowsForSourceWindow(normalizedRows);
      await this.ensureAttendanceConstraints();

      const existingRows = await this.findExistingAttendanceRows(normalizedRows);
      const existingKeys = new Set(
        existingRows.map((row) =>
          this.buildAttendanceKey(row.EmployeeID, row.AttendanceMonth),
        ),
      );

      const payload = normalizedRows.map((row: {
        EmployeeID: number;
        WorkDays: number;
        AbsentDays: number;
        LeaveDays: number;
        AttendanceMonth: string;
      }) => ({
        EmployeeID: row.EmployeeID,
        WorkDays: row.WorkDays,
        AbsentDays: row.AbsentDays,
        LeaveDays: row.LeaveDays,
        AttendanceMonth: row.AttendanceMonth,
        CreatedAt: new Date(),
      }));

      for (const row of normalizedRows) {
        const key = this.buildAttendanceKey(row.EmployeeID, row.AttendanceMonth);
        if (existingKeys.has(key)) {
          result.updated++;
        } else {
          result.created++;
        }
      }

      if (payload.length > 0) {
        await this.upsertAttendanceRows(payload);
      }

      return this.buildSyncResponse(
        'Đồng bộ chấm công hoàn tất',
        startedAt,
        result,
        { month, year },
      );
    } catch (error) {
      return this.buildTopLevelFailure(
        `Đồng bộ chấm công thất bại: ${(error as Error).message}`,
        startedAt,
        result,
      );
    }
  }

  async syncAll(): Promise<SyncResponse> {
    const startedAt = new Date();
    const results = [
      await this.syncDepartments(),
      await this.syncPositions(),
      await this.syncEmployees(),
      await this.syncAttendance(),
    ];

    const hasFailed = results.some((result) => result.status === 'failed');
    const hasPartial = results.some(
      (result) => result.status === 'partial_failed',
    );
    const completedAt = new Date();
    const duration = `${(completedAt.getTime() - startedAt.getTime()) / 1000}s`;

    const status: 'success' | 'failed' | 'partial_failed' = hasFailed
      ? 'failed'
      : hasPartial
        ? 'partial_failed'
        : 'success';

    const statusRecord = {
      entity: 'ALL',
      startedAt: startedAt.toISOString(),
      completedAt: completedAt.toISOString(),
      status: status.toUpperCase(),
      results,
    };
    this.lastSyncResult = statusRecord;
    await this.persistSyncStatus('ALL', status.toUpperCase(), startedAt, completedAt, statusRecord);

    return {
      status,
      message:
        status === 'success'
          ? 'Đồng bộ toàn bộ hoàn tất'
          : 'Đồng bộ toàn bộ hoàn tất nhưng có lỗi',
      data: {
        startedAt: startedAt.toISOString(),
        completedAt: completedAt.toISOString(),
        duration,
        results,
      },
    };
  }

  async getStatus(): Promise<Record<string, unknown>> {
    const latest = await this.syncStatusRepo.findOne({
      where: {},
      order: { StatusID: 'DESC' },
    });

    return {
      status: 'success',
      data: latest?.Details || this.lastSyncResult || { message: 'Chưa có lần đồng bộ nào được thực hiện' },
      connections: this.databaseConnectionsService.getConnectionStatuses(),
    };
  }

  private async findHumanAttendanceTable(): Promise<string | null> {
    const rows = await this.humanDataSource.query(`
      SELECT TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_TYPE = 'BASE TABLE'
        AND LOWER(TABLE_NAME) IN ('attendance', 'attendances')
    `);

    return rows[0]?.TABLE_NAME ?? null;
  }

  private async getHumanTableColumns(tableName: string): Promise<string[]> {
    const rows = await this.humanDataSource.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = '${tableName}'
      ORDER BY ORDINAL_POSITION
    `);

    return rows.map((row: Record<string, string>) => row.COLUMN_NAME);
  }

  private normalizeAttendanceDate(value: unknown): string {
    const date = new Date(String(value));

    if (Number.isNaN(date.getTime())) {
      throw new Error(`Invalid attendance date: ${String(value)}`);
    }

    const year = date.getUTCFullYear();
    const month = `${date.getUTCMonth() + 1}`.padStart(2, '0');
    const day = `${date.getUTCDate()}`.padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private buildAttendanceKey(employeeId: number, attendanceMonth: Date | string): string {
    const normalizedMonth =
      typeof attendanceMonth === 'string'
        ? attendanceMonth
        : this.normalizeAttendanceDate(attendanceMonth);

    return `${employeeId}|${normalizedMonth}`;
  }

  private async cleanupAttendanceRowsForMonthlySnapshots(): Promise<void> {
    await this.payrollAttendanceRepo.query(`
      DELETE FROM attendance
      WHERE AttendanceID IN (
        SELECT AttendanceID FROM (
          SELECT
            AttendanceID,
            ROW_NUMBER() OVER (
              PARTITION BY EmployeeID, AttendanceMonth
              ORDER BY AttendanceID DESC
            ) AS row_num
          FROM attendance
        ) ranked
        WHERE ranked.row_num > 1
      )
    `);
  }

  private async cleanupAttendanceRowsForSourceWindow(
    rows: Array<{
      EmployeeID: number;
      WorkDays: number;
      AbsentDays: number;
      LeaveDays: number;
      AttendanceMonth: string;
    }>,
  ): Promise<void> {
    for (const row of rows) {
      await this.payrollAttendanceRepo.query(
        `
          DELETE FROM attendance
          WHERE EmployeeID = ?
            AND WorkDays = ?
            AND AbsentDays = ?
            AND LeaveDays = ?
            AND ABS(DATEDIFF(AttendanceMonth, ?)) <= 1
            AND DATE(AttendanceMonth) <> DATE(?)
        `,
        [
          row.EmployeeID,
          row.WorkDays,
          row.AbsentDays,
          row.LeaveDays,
          row.AttendanceMonth,
          row.AttendanceMonth,
        ],
      );
    }
  }

  private async ensureAttendanceConstraints(): Promise<void> {
    const primaryKeyRows: Array<{ Key_name: string }> =
      await this.payrollAttendanceRepo.query(`
        SHOW INDEX FROM attendance WHERE Key_name = 'PRIMARY'
      `);

    if (primaryKeyRows.length === 0) {
      await this.payrollAttendanceRepo.query(`
        ALTER TABLE attendance
        MODIFY AttendanceID INT NOT NULL AUTO_INCREMENT,
        ADD PRIMARY KEY (AttendanceID)
      `);
    }

    const uniqueIndexRows: Array<{ INDEX_NAME: string }> =
      await this.payrollAttendanceRepo.query(`
        SELECT INDEX_NAME
        FROM information_schema.statistics
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'attendance'
          AND INDEX_NAME = 'ux_attendance_employee_month'
      `);

    if (uniqueIndexRows.length === 0) {
      await this.payrollAttendanceRepo.query(`
        ALTER TABLE attendance
        ADD UNIQUE KEY ux_attendance_employee_month (EmployeeID, AttendanceMonth)
      `);
    }
  }

  private async findExistingAttendanceRows(
    rows: Array<{ EmployeeID: number; AttendanceMonth: string }>,
  ): Promise<Array<{ EmployeeID: number; AttendanceMonth: Date | string }>> {
    if (rows.length === 0) {
      return [];
    }

    const placeholders = rows.map(() => '(?, ?)').join(', ');
    const parameters = rows.flatMap((row) => [row.EmployeeID, row.AttendanceMonth]);

    return this.payrollAttendanceRepo.query(
      `
        SELECT EmployeeID, DATE_FORMAT(AttendanceMonth, '%Y-%m-%d') AS AttendanceMonth
        FROM attendance
        WHERE (EmployeeID, AttendanceMonth) IN (${placeholders})
      `,
      parameters,
    );
  }

  private async upsertAttendanceRows(
    rows: Array<{
      EmployeeID: number;
      WorkDays: number;
      AbsentDays: number;
      LeaveDays: number;
      AttendanceMonth: string;
      CreatedAt: Date;
    }>,
  ): Promise<void> {
    const placeholders = rows.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');
    const parameters = rows.flatMap((row) => [
      row.EmployeeID,
      row.WorkDays,
      row.AbsentDays,
      row.LeaveDays,
      row.AttendanceMonth,
      row.CreatedAt,
    ]);

    await this.payrollAttendanceRepo.query(
      `
        INSERT INTO attendance (
          EmployeeID,
          WorkDays,
          AbsentDays,
          LeaveDays,
          AttendanceMonth,
          CreatedAt
        )
        VALUES ${placeholders}
        ON DUPLICATE KEY UPDATE
          WorkDays = VALUES(WorkDays),
          AbsentDays = VALUES(AbsentDays),
          LeaveDays = VALUES(LeaveDays),
          CreatedAt = VALUES(CreatedAt)
      `,
      parameters,
    );
  }

  private async buildSyncResponse(
    message: string,
    startedAt: Date,
    result: SyncResult,
    extraData: Record<string, unknown> = {},
  ): Promise<SyncResponse> {
    const completedAt = new Date();
    const status: 'success' | 'partial_failed' =
      result.failed > 0 ? 'partial_failed' : 'success';

    const statusRecord = {
      startedAt: startedAt.toISOString(),
      completedAt: completedAt.toISOString(),
      status: status.toUpperCase(),
      ...result,
    };
    this.lastSyncResult = statusRecord;
    await this.persistSyncStatus(result.entity, status.toUpperCase(), startedAt, completedAt, statusRecord);

    return {
      status,
      message,
      data: {
        entity: result.entity,
        startedAt: startedAt.toISOString(),
        completedAt: completedAt.toISOString(),
        duration: `${(completedAt.getTime() - startedAt.getTime()) / 1000}s`,
        totalRecords: result.totalRecords,
        synced: result.created + result.updated,
        created: result.created,
        updated: result.updated,
        failed: result.failed,
        targetRecords: result.targetRecords,
        errors: result.errors.length > 0 ? result.errors : undefined,
        ...extraData,
      },
    };
  }

  private async buildTopLevelFailure(
    message: string,
    startedAt: Date,
    result: SyncResult,
  ): Promise<SyncResponse> {
    const completedAt = new Date();

    const statusRecord = {
      startedAt: startedAt.toISOString(),
      completedAt: completedAt.toISOString(),
      status: 'FAILED',
      ...result,
      message,
    };
    this.lastSyncResult = statusRecord;
    await this.persistSyncStatus(result.entity, 'FAILED', startedAt, completedAt, statusRecord);

    return {
      status: 'failed',
      message,
      errorCode: 500,
    };
  }

  private async persistSyncStatus(
    syncType: string,
    status: string,
    startedAt: Date,
    completedAt: Date,
    details: Record<string, unknown>,
  ) {
    await this.syncStatusRepo.save(
      this.syncStatusRepo.create({
        SyncType: syncType,
        Status: status,
        StartedAt: startedAt,
        CompletedAt: completedAt,
        Details: details,
      }),
    );
  }
}
