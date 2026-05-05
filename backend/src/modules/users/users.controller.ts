import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Permissions } from '../auth/permissions.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /api/v1/users
   * Requires: user.manage
   */
  @Get()
  @Permissions('user.manage')
  async findAll(
    @Query() query: { page?: number; limit?: number; search?: string },
  ) {
    return this.usersService.findAll({
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      search: query.search,
    });
  }

  /**
   * GET /api/v1/users/:id
   * Requires: user.manage
   */
  @Get(':id')
  @Permissions('user.manage')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  /**
   * POST /api/v1/users
   * Requires: user.manage
   */
  @Post()
  @Permissions('user.manage')
  async create(
    @Body()
    body: {
      username: string;
      Username?: string;
      email: string;
      Email?: string;
      password: string;
      PasswordHash?: string;
      fullName?: string;
      FullName?: string;
      employeeId?: number;
      EmployeeID?: number;
      roleNames?: string[];
      Role?: string;
    },
  ) {
    return this.usersService.create(body);
  }

  /**
   * PUT /api/v1/users/:id
   * Requires: user.manage
   */
  @Put(':id')
  @Permissions('user.manage')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      fullName?: string;
      FullName?: string;
      email?: string;
      Email?: string;
      isActive?: boolean;
      IsActive?: boolean;
      employeeId?: number;
      EmployeeID?: number;
      Role?: string;
      role?: string;
      roleNames?: string[];
    },
  ) {
    return this.usersService.update(id, body);
  }

  /**
   * PATCH /api/v1/users/:id
   * FE generic CRUD uses PATCH.
   * Requires: user.manage
   */
  @Patch(':id')
  @Permissions('user.manage')
  async patch(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      fullName?: string;
      FullName?: string;
      email?: string;
      Email?: string;
      isActive?: boolean;
      IsActive?: boolean;
      employeeId?: number;
      EmployeeID?: number;
      Role?: string;
      role?: string;
      roleNames?: string[];
    },
  ) {
    return this.usersService.update(id, body);
  }

  /**
   * PUT /api/v1/users/:id/roles
   * Assign/replace roles for a user.
   * Requires: role.manage
   */
  @Put(':id/roles')
  @Permissions('role.manage')
  async assignRoles(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { roleNames: string[] },
  ) {
    return this.usersService.assignRoles(id, body.roleNames);
  }

  /**
   * DELETE /api/v1/users/:id
   * Requires: user.manage
   */
  @Delete(':id')
  @Permissions('user.manage')
  async deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.deactivate(id);
  }
}

@Controller('roles')
export class RbacController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Permissions('role.manage')
  findRoles() {
    return this.usersService.findRoles();
  }

  @Get(':id/permissions')
  @Permissions('role.manage')
  getRolePermissions(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getRolePermissions(id);
  }

  @Put(':id/permissions')
  @Permissions('role.manage')
  assignRolePermissions(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { permissions: string[] },
  ) {
    return this.usersService.assignRolePermissions(id, body.permissions ?? []);
  }
}
