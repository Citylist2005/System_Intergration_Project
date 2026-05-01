import { Controller, Get, Query } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { AuditService } from './audit.service';

@Controller('audit-logs')
@Roles('Admin')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  findAll(@Query() query: { search?: string; page?: number; limit?: number }) {
    return this.auditService.findAll(query);
  }
}
