import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { AttendanceService } from './attendance.service';
import { AttendanceQueryDto, AttendanceSummaryQueryDto } from './dto/attendance-query.dto';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  /**
   * GET /api/v1/attendance
   * Join attendance + employees_payroll
   * Returns: EmployeeID, FullName, WorkDays, AbsentDays, LeaveDays, AttendanceMonth
   */
  @Get()
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
   * Attendance summary per employee
   */
  @Get('summary')
  async getSummary(@Query() query: AttendanceSummaryQueryDto) {
    return this.attendanceService.getSummary({
      employeeId: query.employeeId,
      month: query.month,
      year: query.year,
    });
  }

  @Post('manual')
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
    @Req() request: Request & { user?: { sub?: number; username?: string; role?: string } },
  ) {
    return this.attendanceService.upsertManual(body, request.user, request.ip);
  }

  @Put(':id')
  async updateManual(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      workDays: number;
      absentDays: number;
      leaveDays: number;
      overtimeHours?: number;
    },
    @Req() request: Request & { user?: { sub?: number; username?: string; role?: string } },
  ) {
    return this.attendanceService.updateManual(id, body, request.user, request.ip);
  }
}
