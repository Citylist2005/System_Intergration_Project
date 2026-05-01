import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { ok } from '../../common/api-response';
import { AuditLog } from '../../database/payroll/entities/audit-log.entity';

export interface AuditActor {
  sub?: number;
  username?: string;
  role?: string;
  employeeId?: number | null;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog, 'payrollConnection')
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  async write(params: {
    actor?: AuditActor;
    action: string;
    entityType: string;
    entityId?: string | number;
    oldValues?: unknown;
    newValues?: unknown;
    ipAddress?: string;
  }) {
    await this.auditRepo.save(
      this.auditRepo.create({
        UserID: params.actor?.sub,
        Username: params.actor?.username,
        Action: params.action,
        EntityType: params.entityType,
        EntityID: params.entityId === undefined ? undefined : String(params.entityId),
        OldValues: params.oldValues,
        NewValues: params.newValues,
        IPAddress: params.ipAddress,
      }),
    );
  }

  async findAll(query: { search?: string; page?: number; limit?: number }) {
    const page = Math.max(Number(query.page ?? 1), 1);
    const limit = Math.min(Math.max(Number(query.limit ?? 20), 1), 100);
    const skip = (page - 1) * limit;
    const search = query.search?.trim();
    const where = search
      ? [
          { Username: Like(`%${search}%`) },
          { Action: Like(`%${search}%`) },
          { EntityType: Like(`%${search}%`) },
          { EntityID: Like(`%${search}%`) },
        ]
      : undefined;

    const [data, total] = await this.auditRepo.findAndCount({
      where,
      skip,
      take: limit,
      order: { LogID: 'DESC' },
    });

    return ok('Danh sách nhật ký hệ thống', data, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  }
}
