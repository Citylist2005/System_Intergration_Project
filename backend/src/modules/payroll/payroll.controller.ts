import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { CalculatePayrollDto, FindPayrollQueryDto } from './dto/find-payroll-query.dto';
import { UpdatePayrollDto, UpsertPayrollDto } from './dto/manual-payroll.dto';

@Controller('payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  /**
   * GET /api/v1/payroll
   * List payroll records
   */
  @Get()
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
   * Calculate payroll for given month/year
   */
  @Post('calculate')
  async calculate(@Body() body: CalculatePayrollDto) {
    return this.payrollService.calculate(body.month, body.year, body.employeeIds);
  }

  @Post('manual')
  async upsertManualPayroll(@Body() body: UpsertPayrollDto) {
    return this.payrollService.upsertManualPayroll(body);
  }

  @Put(':id')
  async updatePayroll(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdatePayrollDto,
  ) {
    return this.payrollService.updatePayroll(id, body);
  }
}
