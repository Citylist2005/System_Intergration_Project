import { Controller, Get, Header, Query } from '@nestjs/common';
import { Permissions } from '../auth/permissions.decorator';
import { ReportsService } from './reports.service';

@Controller('reports')
@Permissions('report.read')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('attendance/export')
  @Header('Content-Type', 'text/csv')
  exportAttendance(@Query('month') month: string, @Query('year') year: string) {
    return this.reportsService.exportAttendanceCsv(Number(month), Number(year));
  }

  @Get('payroll/export')
  @Header('Content-Type', 'text/csv')
  exportPayroll(@Query('month') month: string, @Query('year') year: string) {
    return this.reportsService.exportPayrollCsv(Number(month), Number(year));
  }

  @Get('audit/export')
  @Header('Content-Type', 'text/csv')
  exportAudit(@Query('from') from?: string, @Query('to') to?: string) {
    return this.reportsService.exportAuditLogCsv(from, to);
  }

  @Get('salary-by-department')
  getSalaryByDepartment(@Query('month') month: string, @Query('year') year: string) {
    return this.reportsService.getSalaryByDepartment(Number(month), Number(year));
  }

  @Get('employee-distribution')
  getEmployeeDistribution() {
    return this.reportsService.getEmployeeDistribution();
  }

  @Get('payroll-trend')
  getPayrollTrend(@Query('months') months?: string) {
    return this.reportsService.getPayrollTrend(Number(months ?? 6));
  }
}
