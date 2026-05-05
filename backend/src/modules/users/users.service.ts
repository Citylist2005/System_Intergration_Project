import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { User } from '../../database/payroll/entities/user.entity';
import { Role } from '../../database/payroll/entities/role.entity';
import { UserRole } from '../../database/payroll/entities/user-role.entity';
import { Permission } from '../../database/payroll/entities/permission.entity';
import { RolePermission } from '../../database/payroll/entities/role-permission.entity';
import { hashPassword } from '../auth/password.service';
import { normalizeRoleName } from '../auth/rbac-defaults';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User, 'payrollConnection')
    private readonly userRepo: Repository<User>,
    @InjectRepository(Role, 'payrollConnection')
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(UserRole, 'payrollConnection')
    private readonly userRoleRepo: Repository<UserRole>,
    @InjectRepository(Permission, 'payrollConnection')
    private readonly permissionRepo: Repository<Permission>,
    @InjectRepository(RolePermission, 'payrollConnection')
    private readonly rolePermissionRepo: Repository<RolePermission>,
  ) {}

  async findAll(opts: { page: number; limit: number; search?: string }) {
    const { page, limit, search } = opts;
    const where = search
      ? [{ Username: ILike(`%${search}%`) }, { Email: ILike(`%${search}%`) }]
      : undefined;

    const [users, total] = await this.userRepo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { CreatedAt: 'DESC' },
    });

    // Load roles for each user
    const result = await Promise.all(
      users.map(async (u) => {
        const userRoles = await this.userRoleRepo.find({
          where: { userId: u.UserID },
          relations: ['role'],
        });
        return {
          id: u.UserID,
          UserID: u.UserID,
          username: u.Username,
          Username: u.Username,
          email: u.Email,
          Email: u.Email,
          fullName: u.FullName,
          FullName: u.FullName,
          isActive: u.IsActive,
          IsActive: u.IsActive,
          employeeId: u.EmployeeID,
          EmployeeID: u.EmployeeID,
          Role: u.Role,
          lastLoginAt: u.LastLoginAt,
          LastLoginAt: u.LastLoginAt,
          createdAt: u.CreatedAt,
          CreatedAt: u.CreatedAt,
          roles: userRoles.length
            ? userRoles.map((ur) => ur.role.name)
            : [normalizeRoleName(u.Role)].filter(Boolean),
        };
      }),
    );

    return {
      status: 'success',
      data: result,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number) {
    const user = await this.userRepo.findOne({ where: { UserID: id } });
    if (!user) throw new NotFoundException('Người dùng không tồn tại');

    const userRoles = await this.userRoleRepo.find({
      where: { userId: id },
      relations: ['role', 'role.rolePermissions', 'role.rolePermissions.permission'],
    });

    const roles: string[] = [];
    const permSet = new Set<string>();
    for (const ur of userRoles) {
      roles.push(ur.role.name);
      for (const rp of ur.role.rolePermissions ?? []) {
        permSet.add(rp.permission.name);
      }
    }

    if (roles.length === 0) {
      const legacyRole = normalizeRoleName(user.Role);
      if (legacyRole) roles.push(legacyRole);
    }

    return {
      status: 'success',
      data: {
        id: user.UserID,
        UserID: user.UserID,
        username: user.Username,
        Username: user.Username,
        email: user.Email,
        Email: user.Email,
        fullName: user.FullName,
        FullName: user.FullName,
        isActive: user.IsActive,
        IsActive: user.IsActive,
        employeeId: user.EmployeeID,
        EmployeeID: user.EmployeeID,
        Role: user.Role,
        lastLoginAt: user.LastLoginAt,
        LastLoginAt: user.LastLoginAt,
        createdAt: user.CreatedAt,
        CreatedAt: user.CreatedAt,
        roles,
        permissions: Array.from(permSet),
      },
    };
  }

  async create(body: {
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
    role?: string;
  }) {
    const username = body.username ?? body.Username;
    const email = body.email ?? body.Email;
    const password = body.password ?? body.PasswordHash;
    const fullName = body.fullName ?? body.FullName;
    const employeeId = body.employeeId ?? body.EmployeeID;

    if (!username || !email || !password) {
      throw new BadRequestException('Username, Email và Password là bắt buộc');
    }

    const existing = await this.userRepo.findOne({
      where: [{ Username: username }, { Email: email }],
    });
    if (existing) throw new BadRequestException('Tên đăng nhập hoặc email đã tồn tại');

    const normalizedRole = normalizeRoleName(
      body.roleNames?.[0] ?? body.Role ?? body.role,
    );

    const user = await this.userRepo.save(
      this.userRepo.create({
        Username: username,
        Email: email,
        PasswordHash: hashPassword(password),
        FullName: fullName,
        EmployeeID: employeeId,
        Role: this.toLegacyRole(normalizedRole),
        IsActive: true,
      }),
    );

    const roleNames = body.roleNames?.length
      ? body.roleNames
      : normalizedRole
        ? [normalizedRole]
        : [];

    if (roleNames.length) {
      await this.assignRoles(user.UserID, roleNames);
    }

    return { status: 'success', message: 'Tạo người dùng thành công', data: { id: user.UserID } };
  }

  async update(
    id: number,
    body: {
      fullName?: string;
      FullName?: string;
      email?: string;
      Email?: string;
      isActive?: boolean;
      IsActive?: boolean;
      EmployeeID?: number;
      employeeId?: number;
      Role?: string;
      role?: string;
      roleNames?: string[];
    },
  ) {
    const user = await this.userRepo.findOne({ where: { UserID: id } });
    if (!user) throw new NotFoundException('Người dùng không tồn tại');

    if (body.fullName !== undefined || body.FullName !== undefined) {
      user.FullName = body.fullName ?? body.FullName!;
    }
    if (body.email !== undefined || body.Email !== undefined) {
      user.Email = body.email ?? body.Email!;
    }
    if (body.isActive !== undefined || body.IsActive !== undefined) {
      user.IsActive = Boolean(body.isActive ?? body.IsActive);
    }
    if (body.employeeId !== undefined || body.EmployeeID !== undefined) {
      user.EmployeeID = body.employeeId ?? body.EmployeeID!;
    }
    const normalizedRole = normalizeRoleName(
      body.roleNames?.[0] ?? body.Role ?? body.role,
    );
    if (normalizedRole) {
      user.Role = this.toLegacyRole(normalizedRole);
    }

    await this.userRepo.save(user);
    if (body.roleNames?.length || normalizedRole) {
      await this.assignRoles(user.UserID, body.roleNames ?? [normalizedRole!]);
    }
    return { status: 'success', message: 'Cập nhật người dùng thành công' };
  }

  async assignRoles(userId: number, roleNames: string[]) {
    const user = await this.userRepo.findOne({ where: { UserID: userId } });
    if (!user) throw new NotFoundException('Người dùng không tồn tại');

    // Clear existing roles
    await this.userRoleRepo.delete({ userId });

    const normalizedRoles = roleNames
      .map((roleName) => normalizeRoleName(roleName) ?? roleName)
      .filter((roleName): roleName is string => Boolean(roleName));

    // Assign new roles
    for (const roleName of normalizedRoles) {
      const role = await this.roleRepo.findOne({ where: { name: roleName } });
      if (!role) throw new BadRequestException(`Vai trò không tồn tại: ${roleName}`);
      await this.userRoleRepo.save(this.userRoleRepo.create({ userId, roleId: role.id }));
    }

    const primaryRole = normalizeRoleName(normalizedRoles[0]);
    if (primaryRole) {
      user.Role = this.toLegacyRole(primaryRole);
      await this.userRepo.save(user);
    }

    return { status: 'success', message: 'Cập nhật vai trò thành công' };
  }

  async deactivate(id: number) {
    const user = await this.userRepo.findOne({ where: { UserID: id } });
    if (!user) throw new NotFoundException('Người dùng không tồn tại');

    user.IsActive = false;
    await this.userRepo.save(user);
    return { status: 'success', message: 'Vô hiệu hoá người dùng thành công' };
  }
  async findRoles() {
    const roles = await this.roleRepo.find({
      relations: ['rolePermissions', 'rolePermissions.permission'],
      order: { name: 'ASC' },
    });
    return {
      status: 'success',
      data: roles.map((role) => ({
        id: role.id,
        name: role.name,
        description: role.description,
        permissions: (role.rolePermissions ?? []).map((rp) => rp.permission.name),
      })),
    };
  }

  async getRolePermissions(roleId: number) {
    const role = await this.roleRepo.findOne({
      where: { id: roleId },
      relations: ['rolePermissions', 'rolePermissions.permission'],
    });
    if (!role) throw new NotFoundException('Vai trÃ² khÃ´ng tá»“n táº¡i');
    return {
      status: 'success',
      data: (role.rolePermissions ?? []).map((rp) => rp.permission),
    };
  }

  async assignRolePermissions(roleId: number, permissionNames: string[]) {
    const role = await this.roleRepo.findOne({ where: { id: roleId } });
    if (!role) throw new NotFoundException('Vai trÃ² khÃ´ng tá»“n táº¡i');

    await this.rolePermissionRepo.delete({ roleId });
    for (const name of permissionNames) {
      let permission = await this.permissionRepo.findOne({ where: { name } });
      permission =
        permission ??
        (await this.permissionRepo.save(
          this.permissionRepo.create({ name, description: name }),
        ));
      await this.rolePermissionRepo.save(
        this.rolePermissionRepo.create({ roleId, permissionId: permission.id }),
      );
    }

    return this.getRolePermissions(roleId);
  }

  private toLegacyRole(roleName?: string | null) {
    if (roleName === 'ADMIN') return 'Admin';
    if (roleName === 'HR_MANAGER') return 'HR_Manager';
    if (roleName === 'PAYROLL_MANAGER') return 'Payroll_Manager';
    if (roleName === 'EMPLOYEE') return 'Employee';
    return 'Employee';
  }
}
