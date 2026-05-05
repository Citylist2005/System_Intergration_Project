import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { FindEmployeesQueryDto } from './dto/find-employees-query.dto';
import { Permissions } from '../auth/permissions.decorator';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  /**
   * GET /api/v1/employees
   * Requires: employee.read
   */
  @Get()
  @Permissions('employee.read')
  async findAll(@Query() query: FindEmployeesQueryDto) {
    return this.employeesService.findAll({
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      search: query.search,
      departmentId: query.departmentId,
      status: query.status,
    });
  }

  /**
   * POST /api/v1/employees
   * Requires: employee.create
   */
  @Post()
  @Permissions('employee.create')
  async create(
    @Body() createEmployeeDto: CreateEmployeeDto,
    @Req() request: Request & { user?: { sub?: number; username?: string } },
  ) {
    return this.employeesService.create(createEmployeeDto, request.user, request.ip);
  }

  /**
   * PUT /api/v1/employees/:id
   * Requires: employee.update
   */
  @Put(':id')
  @Permissions('employee.update')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
    @Req() request: Request & { user?: { sub?: number; username?: string } },
  ) {
    return this.employeesService.update(id, updateEmployeeDto, request.user, request.ip);
  }

  /**
   * DELETE /api/v1/employees/:id
   * Requires: employee.delete
   */
  @Delete(':id')
  @Permissions('employee.delete')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request & { user?: { sub?: number; username?: string } },
  ) {
    return this.employeesService.softDelete(id, request.user, request.ip);
  }

  /**
   * DELETE /api/v1/employees/:id/permanent
   * Requires: employee.delete
   */
  @Delete(':id/permanent')
  @Permissions('employee.delete')
  async permanentRemove(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request & { user?: { sub?: number; username?: string } },
  ) {
    return this.employeesService.hardDelete(id, request.user, request.ip);
  }
}
