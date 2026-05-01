import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Like, Not, Repository } from 'typeorm';
import { EmployeesPayroll } from '../../database/payroll/entities/employees-payroll.entity';
import { normalizeEmployeeStatus } from '../../common/employee-status';
import { AuditActor, AuditService } from '../audit/audit.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

interface FindAllParams {
  page: number;
  limit: number;
  search?: string;
  departmentId?: number;
  status?: string;
}

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(EmployeesPayroll, 'payrollConnection')
    private readonly employeesPayrollRepo: Repository<EmployeesPayroll>,
    private readonly auditService: AuditService,
  ) {}

  private serializeEmployee(employee: EmployeesPayroll) {
    return {
      EmployeeID: employee.EmployeeID,
      EmployeeCode: employee.EmployeeCode,
      FullName: employee.FullName,
      Email: employee.Email,
      Phone: employee.Phone,
      DepartmentID: employee.DepartmentID,
      PositionID: employee.PositionID,
      Status: normalizeEmployeeStatus(employee.Status),
      BaseSalary: employee.BaseSalary,
      HireDate: employee.HireDate,
      SyncedAt: employee.SyncedAt,
    };
  }

  /**
   * Fetch employees from PAYROLL_2026 (MySQL)
   * Returns: EmployeeID, FullName, DepartmentID, PositionID, Status
   */
  async findAll(params: FindAllParams) {
    const { page, limit, search, departmentId, status } = params;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<EmployeesPayroll> = {};

    if (search) {
      where.FullName = Like(`%${search}%`);
    }
    if (departmentId) {
      where.DepartmentID = departmentId;
    }
    if (status && status !== 'ALL') {
      where.Status = normalizeEmployeeStatus(status);
    } else if (!status) {
      where.Status = Not('Inactive');
    }

    const [data, total] = await this.employeesPayrollRepo.findAndCount({
      where,
      skip,
      take: limit,
      order: { EmployeeID: 'ASC' },
    });

    return {
      status: 'success',
      message: 'Employees fetched successfully',
      data: data.map((employee) => this.serializeEmployee(employee)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(createEmployeeDto: CreateEmployeeDto, actor?: AuditActor, ipAddress?: string) {
    const existingEmployee = await this.employeesPayrollRepo.findOne({
      where: { EmployeeID: createEmployeeDto.EmployeeID },
    });

    if (existingEmployee) {
      throw new ConflictException(
        `Mã nhân viên ${createEmployeeDto.EmployeeID} đã tồn tại trong cơ sở dữ liệu`,
      );
    }

    const employee = this.employeesPayrollRepo.create({
      ...createEmployeeDto,
      Status: normalizeEmployeeStatus(createEmployeeDto.Status),
      SyncedAt: new Date(),
    });

    const savedEmployee = await this.employeesPayrollRepo.save(employee);
    await this.auditService.write({
      actor,
      action: 'CREATE',
      entityType: 'Employee',
      entityId: savedEmployee.EmployeeID,
      newValues: savedEmployee,
      ipAddress,
    });

    return {
      status: 'success',
      message: 'Employee created successfully',
      data: this.serializeEmployee(savedEmployee),
    };
  }

  async update(
    employeeId: number,
    updateEmployeeDto: UpdateEmployeeDto,
    actor?: AuditActor,
    ipAddress?: string,
  ) {
    const employee = await this.employeesPayrollRepo.findOne({
      where: { EmployeeID: employeeId },
    });

    if (!employee) {
      throw new NotFoundException(`Employee ${employeeId} not found`);
    }

    const before = { ...employee };
    Object.assign(employee, updateEmployeeDto, {
      Status: normalizeEmployeeStatus(updateEmployeeDto.Status),
      SyncedAt: new Date(),
    });

    const savedEmployee = await this.employeesPayrollRepo.save(employee);
    await this.auditService.write({
      actor,
      action: 'UPDATE',
      entityType: 'Employee',
      entityId: savedEmployee.EmployeeID,
      oldValues: before,
      newValues: savedEmployee,
      ipAddress,
    });

    return {
      status: 'success',
      message: 'Employee updated successfully',
      data: this.serializeEmployee(savedEmployee),
    };
  }

  async softDelete(employeeId: number, actor?: AuditActor, ipAddress?: string) {
    const employee = await this.employeesPayrollRepo.findOne({
      where: { EmployeeID: employeeId },
    });

    if (!employee) {
      throw new NotFoundException(`Employee ${employeeId} not found`);
    }

    const before = { ...employee };
    employee.Status = 'Inactive';
    employee.SyncedAt = new Date();

    const savedEmployee = await this.employeesPayrollRepo.save(employee);
    await this.auditService.write({
      actor,
      action: 'DELETE',
      entityType: 'Employee',
      entityId: savedEmployee.EmployeeID,
      oldValues: before,
      newValues: savedEmployee,
      ipAddress,
    });

    return {
      status: 'success',
      message: 'Employee deactivated successfully',
      data: this.serializeEmployee(savedEmployee),
    };
  }
}
