import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { Permissions } from '../auth/permissions.decorator';
import { AlertsService } from './alerts.service';

@Controller('alerts')
@Permissions('alert.read')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  findAll(@Query() query: { type?: string; unread?: string; page?: number; limit?: number }) {
    return this.alertsService.findAll(query);
  }

  @Patch(':id/read')
  markRead(@Param('id', ParseIntPipe) id: number) {
    return this.alertsService.markRead(id);
  }

  @Post('generate')
  @Permissions('alert.manage')
  async generate(@Body() body: { month?: number; year?: number }) {
    const now = new Date();
    const month = Number(body.month ?? now.getMonth() + 1);
    const year = Number(body.year ?? now.getFullYear());
    const birthday = await this.alertsService.generateBirthdayAlerts();
    const absence = await this.alertsService.generateAbsenceAlerts(month, year);
    const payroll = await this.alertsService.generatePayrollAnomalyAlerts(month, year);
    return { status: 'success', data: { birthday, absence, payroll } };
  }
}
