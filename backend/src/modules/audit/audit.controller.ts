import { Controller, Get, Query } from '@nestjs/common';
import { AuditService } from './audit.service';
import { Permissions } from '../auth/permissions.decorator';

@Controller('audit-logs')
@Permissions('audit.read')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  findAll(@Query() query: { search?: string; page?: number; limit?: number }) {
    return this.auditService.findAll(query);
  }
}
