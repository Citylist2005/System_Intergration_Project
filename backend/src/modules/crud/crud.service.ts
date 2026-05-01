import { NotFoundException } from '@nestjs/common';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { ok } from '../../common/api-response';
import { AuditActor, AuditService } from '../audit/audit.service';

type EntityRecord = Record<string, unknown>;

export interface CrudConfig {
  entityName: string;
  idField: string;
  searchFields?: string[];
  softDeleteField?: string;
  softDeleteValue?: unknown;
  defaultOrder?: Record<string, 'ASC' | 'DESC'>;
}

export class CrudService<T extends EntityRecord> {
  constructor(
    private readonly repo: Repository<T>,
    private readonly config: CrudConfig,
    private readonly auditService: AuditService,
  ) {}

  async findAll(query: { search?: string; page?: number; limit?: number }, actor?: AuditActor) {
    const page = Math.max(Number(query.page ?? 1), 1);
    const limit = Math.min(Math.max(Number(query.limit ?? 20), 1), 100);
    const skip = (page - 1) * limit;
    const search = query.search?.trim();
    let where: FindOptionsWhere<T> | FindOptionsWhere<T>[] | undefined =
      search && this.config.searchFields?.length
        ? (this.config.searchFields.map((field) => ({
            [field]: Like(`%${search}%`),
          })) as FindOptionsWhere<T>[])
        : undefined;

    const employeeOnly =
      actor?.role?.toLowerCase() === 'employee' &&
      actor.employeeId &&
      this.repo.metadata.columns.some((column) => column.propertyName === 'EmployeeID');

    if (employeeOnly) {
      if (Array.isArray(where)) {
        where = where.map((item) => ({
          ...item,
          EmployeeID: actor.employeeId,
        })) as FindOptionsWhere<T>[];
      } else {
        where = { EmployeeID: actor.employeeId } as FindOptionsWhere<T>;
      }
    }

    const [data, total] = await this.repo.findAndCount({
      where,
      skip,
      take: limit,
      order: this.config.defaultOrder as never,
    });

    return ok(`${this.config.entityName} list fetched`, data, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  }

  async findOne(id: number) {
    const entity = await this.repo.findOne({
      where: { [this.config.idField]: id } as FindOptionsWhere<T>,
    });

    if (!entity) {
      throw new NotFoundException(`${this.config.entityName} ${id} not found`);
    }

    return ok(`${this.config.entityName} detail fetched`, entity);
  }

  async create(body: EntityRecord, actor?: AuditActor, ipAddress?: string) {
    const saved = await this.repo.save(this.repo.create(body as T));
    await this.auditService.write({
      actor,
      action: 'CREATE',
      entityType: this.config.entityName,
      entityId: saved[this.config.idField] as string | number | undefined,
      newValues: saved,
      ipAddress,
    });

    return ok(`${this.config.entityName} created`, saved);
  }

  async update(id: number, body: EntityRecord, actor?: AuditActor, ipAddress?: string) {
    const existing = await this.repo.findOne({
      where: { [this.config.idField]: id } as FindOptionsWhere<T>,
    });

    if (!existing) {
      throw new NotFoundException(`${this.config.entityName} ${id} not found`);
    }

    const before = { ...existing };
    Object.assign(existing, body);
    const saved = await this.repo.save(existing);
    await this.auditService.write({
      actor,
      action: 'UPDATE',
      entityType: this.config.entityName,
      entityId: id,
      oldValues: before,
      newValues: saved,
      ipAddress,
    });

    return ok(`${this.config.entityName} updated`, saved);
  }

  async remove(id: number, actor?: AuditActor, ipAddress?: string) {
    const existing = await this.repo.findOne({
      where: { [this.config.idField]: id } as FindOptionsWhere<T>,
    });

    if (!existing) {
      throw new NotFoundException(`${this.config.entityName} ${id} not found`);
    }

    if (this.config.softDeleteField) {
      Object.assign(existing, {
        [this.config.softDeleteField]: this.config.softDeleteValue ?? false,
      });
      const saved = await this.repo.save(existing);
      await this.auditService.write({
        actor,
        action: 'DELETE',
        entityType: this.config.entityName,
        entityId: id,
        oldValues: existing,
        newValues: saved,
        ipAddress,
      });
      return ok(`${this.config.entityName} disabled`, saved);
    }

    await this.repo.delete(id);
    await this.auditService.write({
      actor,
      action: 'DELETE',
      entityType: this.config.entityName,
      entityId: id,
      oldValues: existing,
      ipAddress,
    });

    return ok(`${this.config.entityName} deleted`, { id });
  }
}
