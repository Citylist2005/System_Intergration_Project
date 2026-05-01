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

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  /**
   * GET /api/v1/employees
   * Fetch employees from PAYROLL_2026 (MySQL)
   */
  @Get()
  async findAll(@Query() query: FindEmployeesQueryDto) {
    return this.employeesService.findAll({
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      search: query.search,
      departmentId: query.departmentId,
      status: query.status,
    });
  }

  @Post()
  async create(
    @Body() createEmployeeDto: CreateEmployeeDto,
    @Req() request: Request & { user?: { sub?: number; username?: string } },
  ) {
    return this.employeesService.create(createEmployeeDto, request.user, request.ip);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
    @Req() request: Request & { user?: { sub?: number; username?: string } },
  ) {
    return this.employeesService.update(id, updateEmployeeDto, request.user, request.ip);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request & { user?: { sub?: number; username?: string } },
  ) {
    return this.employeesService.softDelete(id, request.user, request.ip);
  }
}
