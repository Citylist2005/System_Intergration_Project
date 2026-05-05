import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { CalculatePayrollDto, FindPayrollQueryDto } from './dto/find-payroll-query.dto';
import { UpdatePayrollDto, UpsertPayrollDto } from './dto/manual-payroll.dto';
import { Permissions } from '../auth/permissions.decorator';

@Controller('payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  /**
   * GET /api/v1/payroll
   * Requires: payroll.read
   */
  @Get()
  @Permissions('payroll.read')
  async findAll(@Query() query: FindPayrollQueryDto) {
    return this.payrollService.findAll({
      employeeId: query.employeeId,
      month: query.month,
      year: query.year,
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    });
  }

  /**
   * POST /api/v1/payroll/calculate
   * Requires: payroll.calculate
   */
  @Post('calculate')
  @Permissions('payroll.calculate')
  async calculate(@Body() body: CalculatePayrollDto) {
    return this.payrollService.calculate(body.month, body.year, body.employeeIds);
  }

  /**
   * POST /api/v1/payroll/manual
   * Requires: payroll.update
   */
  @Post('manual')
  @Permissions('payroll.update')
  async upsertManualPayroll(@Body() body: UpsertPayrollDto) {
    return this.payrollService.upsertManualPayroll(body);
  }

  /**
   * PUT /api/v1/payroll/:id
   * Requires: payroll.update
   */
  @Put(':id')
  @Permissions('payroll.update')
  async updatePayroll(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdatePayrollDto,
  ) {
    return this.payrollService.updatePayroll(id, body);
  }
}
