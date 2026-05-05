import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AlertsService } from './alerts.service';

@Injectable()
export class AlertsCronService {
  private readonly logger = new Logger(AlertsCronService.name);

  constructor(private readonly alertsService: AlertsService) {}

  @Cron('0 7 * * *')
  async generateDailyAlerts() {
    const now = new Date();
    this.logger.log('Generating daily HR alerts');
    await this.alertsService.generateBirthdayAlerts();
    await this.alertsService.generateAnniversaryAlerts();
    await this.alertsService.generateAbsenceAlerts(now.getMonth() + 1, now.getFullYear());
    await this.alertsService.generateLeaveOveruseAlerts(now.getMonth() + 1, now.getFullYear());
  }
}
