import { Controller, Post, Body, Get } from '@nestjs/common';
import { SyncService } from './sync.service';
import { SyncAttendanceDto } from './dto/sync-attendance.dto';

@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  /**
   * POST /api/v1/sync/employees
   * Sync employees from HUMAN_2025 (SQL Server) → PAYROLL_2026 (MySQL)
   */
  @Post('employees')
  async syncEmployees() {
    return this.syncService.syncEmployees();
  }

  /**
   * POST /api/v1/sync/departments
   * Sync departments from HUMAN_2025 → PAYROLL_2026
   */
  @Post('departments')
  async syncDepartments() {
    return this.syncService.syncDepartments();
  }

  /**
   * POST /api/v1/sync/positions
   * Sync positions from HUMAN_2025 → PAYROLL_2026
   */
  @Post('positions')
  async syncPositions() {
    return this.syncService.syncPositions();
  }

  /**
   * POST /api/v1/sync/attendance
   * Sync attendance from HUMAN_2025 → PAYROLL_2026
   */
  @Post('attendance')
  async syncAttendance(@Body() body: SyncAttendanceDto) {
    return this.syncService.syncAttendance(body.month, body.year);
  }

  /**
   * POST /api/v1/sync/all
   * Full sync: departments → positions → employees → attendance
   */
  @Post('all')
  async syncAll() {
    return this.syncService.syncAll();
  }

  /**
   * GET /api/v1/sync/status
   * Get last sync status
   */
  @Get('status')
  async getStatus() {
    return this.syncService.getStatus();
  }

  /**
   * GET /api/v1/sync/test-human
   * Test SQL Server humanConnection with top 5 departments
   */
  @Get('test-human')
  async testHumanConnection() {
    return this.syncService.testHumanConnection();
  }
}
