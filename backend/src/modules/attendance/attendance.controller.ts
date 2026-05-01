import { Controller, Get, Query } from '@nestjs/common';
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
}
