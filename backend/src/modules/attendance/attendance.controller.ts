import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { AttendanceService } from './attendance.service';
import { AttendanceQueryDto, AttendanceSummaryQueryDto } from './dto/attendance-query.dto';
import { Permissions } from '../auth/permissions.decorator';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  /**
   * GET /api/v1/attendance
   * Requires: attendance.read
   */
  @Get()
  @Permissions('attendance.read')
  async findAll(@Query() query: AttendanceQueryDto) {
    return this.attendanceService.findAll({
      employeeId: query.employeeId,
      month: query.month,
      year: query.year,
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    });
  }

  /**
   * GET /api/v1/attendance/summary
   * Requires: attendance.read
   */
  @Get('summary')
  @Permissions('attendance.read')
  async getSummary(@Query() query: AttendanceSummaryQueryDto) {
    return this.attendanceService.getSummary({
      employeeId: query.employeeId,
      month: query.month,
      year: query.year,
    });
  }

  /**
   * POST /api/v1/attendance/manual
   * Requires: attendance.create
   */
  @Post('manual')
  @Permissions('attendance.create')
  async upsertManual(
    @Body()
    body: {
      employeeId: number;
      month: number;
      year: number;
      workDays: number;
      absentDays: number;
      leaveDays: number;
      overtimeHours?: number;
    },
    @Req() request: Request & { user?: { sub?: number; username?: string; roles?: string[] } },
  ) {
    return this.attendanceService.upsertManual(body, request.user, request.ip);
  }

  /**
   * POST /api/v1/attendance/bulk
   * Requires: attendance.create
   */
  @Post('bulk')
  @Permissions('attendance.create')
  async bulkUpsert(
    @Body()
    body: {
      rows: Array<{
        employeeId: number;
        month: number;
        year: number;
        workDays: number;
        absentDays: number;
        leaveDays: number;
        overtimeHours?: number;
      }>;
    },
    @Req() request: Request & { user?: { sub?: number; username?: string; roles?: string[] } },
  ) {
    return this.attendanceService.bulkUpsert(body.rows ?? [], request.user, request.ip);
  }

  /**
   * PUT /api/v1/attendance/:id
   * Requires: attendance.update
   */
  @Put(':id')
  @Permissions('attendance.update')
  async updateManual(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      workDays: number;
      absentDays: number;
      leaveDays: number;
      overtimeHours?: number;
    },
    @Req() request: Request & { user?: { sub?: number; username?: string; roles?: string[] } },
  ) {
    return this.attendanceService.updateManual(id, body, request.user, request.ip);
  }

  /**
   * GET /api/v1/attendance/daily-absences
   * Requires: attendance.read
   */
  @Get('daily-absences')
  @Permissions('attendance.read')
  async getDailyAbsences(
    @Query('employeeId', ParseIntPipe) employeeId: number,
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
  ) {
    return this.attendanceService.getDailyAbsences(employeeId, month, year);
  }
}
