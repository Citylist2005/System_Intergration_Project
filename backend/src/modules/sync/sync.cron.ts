import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SyncService } from './sync.service';

@Injectable()
export class SyncCronService {
  private readonly logger = new Logger(SyncCronService.name);

  constructor(private readonly syncService: SyncService) {}

  @Cron('0 2 * * *')
  async syncMasterData() {
    this.logger.log('Running scheduled departments/positions/employees sync');
    await this.syncService.syncDepartments();
    await this.syncService.syncPositions();
    await this.syncService.syncEmployees();
  }

  @Cron('0 3 1 * *')
  async syncPreviousMonthAttendance() {
    const now = new Date();
    const previousMonthDate = new Date(Date.UTC(now.getFullYear(), now.getMonth() - 1, 1));
    this.logger.log('Running scheduled attendance sync');
    await this.syncService.syncAttendance(
      previousMonthDate.getUTCMonth() + 1,
      previousMonthDate.getUTCFullYear(),
    );
  }
}
