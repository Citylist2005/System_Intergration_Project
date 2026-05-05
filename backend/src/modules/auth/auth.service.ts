import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { User } from '../../database/payroll/entities/user.entity';
import { Role } from '../../database/payroll/entities/role.entity';
import { UserRole } from '../../database/payroll/entities/user-role.entity';
import { AuthTokenService } from './auth-token.service';
import { hashPassword, verifyPassword } from './password.service';
import { ROLE_PERMISSION_MAP, normalizeRoleName } from './rbac-defaults';

@Injectable()
export class AuthService {
  private userSchemaReady = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly authTokenService: AuthTokenService,
    @InjectRepository(User, 'payrollConnection')
    private readonly userRepo: Repository<User>,
    @InjectRepository(Role, 'payrollConnection')
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(UserRole, 'payrollConnection')
    private readonly userRoleRepo: Repository<UserRole>,
  ) {}

  // ─── Helper: load roles + permissions for a user ───────────────────────────
  private async loadUserRolesAndPermissions(userId: number) {
    const user = await this.userRepo.findOne({ where: { UserID: userId } });
    const userRoles = await this.userRoleRepo.find({
      where: { userId },
      relations: ['role', 'role.rolePermissions', 'role.rolePermissions.permission'],
    });

    const roles: string[] = [];
    const permissionSet = new Set<string>();

    for (const ur of userRoles) {
      roles.push(ur.role.name);
      for (const rp of ur.role.rolePermissions ?? []) {
        permissionSet.add(rp.permission.name);
      }
    }

    if (roles.length === 0) {
      const legacyRole = normalizeRoleName(user?.Role);
      if (legacyRole) {
        roles.push(legacyRole);
        for (const permission of ROLE_PERMISSION_MAP[legacyRole] ?? []) {
          permissionSet.add(permission);
        }
      }
    }

    return { roles, permissions: Array.from(permissionSet) };
  }

  // ─── Helper: ensure ADMIN user has the ADMIN role assigned ─────────────────
  private async ensureAdminRole(userId: number) {
    const adminRole = await this.roleRepo.findOne({ where: { name: 'ADMIN' } });
    if (!adminRole) return;

    const existing = await this.userRoleRepo.findOne({ where: { userId, roleId: adminRole.id } });
    if (!existing) {
      await this.userRoleRepo.save(this.userRoleRepo.create({ userId, roleId: adminRole.id }));
    }
  }

  async login(username: string, password: string) {
    await this.ensureUserSchema();

    if (!username || !password) {
      throw new UnauthorizedException('Sai tÃªn Ä‘Äƒng nháº­p hoáº·c máº­t kháº©u');
    }

    const adminUsername =
      this.configService.get<string>('ADMIN_EMAIL') ??
      this.configService.get<string>('AUTH_USERNAME') ??
      'admin@docusync.local';
    const adminPassword =
      this.configService.get<string>('ADMIN_PASSWORD') ??
      this.configService.get<string>('AUTH_PASSWORD') ??
      'change-me';

    let user = await this.userRepo.findOne({
      where: [{ Username: username }, { Email: username }],
    });

    const envAdminLogin = username === adminUsername && password === adminPassword;
    const dbLogin = Boolean(user?.IsActive && verifyPassword(password, user.PasswordHash));

    if (!dbLogin && !envAdminLogin) {
      throw new UnauthorizedException('Sai tên đăng nhập hoặc mật khẩu');
    }

    if (!user && envAdminLogin) {
      user = await this.userRepo.save(
        this.userRepo.create({
          Username: adminUsername,
          Email: adminUsername,
          PasswordHash: hashPassword(adminPassword),
          FullName: 'Quản trị viên',
          Role: 'Admin',
          IsActive: true,
        }),
      );
    } else if (user && envAdminLogin && !verifyPassword(password, user.PasswordHash)) {
      user.PasswordHash = hashPassword(password);
      user.IsActive = true;
    }

    if (!user) {
      throw new UnauthorizedException('Sai tên đăng nhập hoặc mật khẩu');
    }

    // Ensure env-based admin always has the ADMIN db-role
    if (envAdminLogin) {
      await this.ensureAdminRole(user.UserID);
      user.Role = 'Admin';
    }

    user.LastLoginAt = new Date();
    await this.userRepo.save(user);

    // Load RBAC roles & permissions
    const { roles, permissions } = await this.loadUserRolesAndPermissions(user.UserID);

    const expiresIn = 3600;
    const accessToken = this.authTokenService.sign(
      {
        sub: user.UserID,
        username: user.Username,
        email: user.Email,
        roles,
        employeeId: user.EmployeeID,
      },
      expiresIn,
    );

    return {
      status: 'success',
      message: 'Đăng nhập thành công',
      data: {
        accessToken,
        expiresIn,
        user: {
          id: user.UserID,
          username: user.Username,
          email: user.Email,
          fullName: user.FullName,
          employeeId: user.EmployeeID,
          roles,
          permissions,
        },
      },
    };
  }

  async getProfile(userId: number) {
    await this.ensureUserSchema();

    const user = await this.userRepo.findOne({ where: { UserID: userId } });
    if (!user) throw new UnauthorizedException('Người dùng không tồn tại');

    const { roles, permissions } = await this.loadUserRolesAndPermissions(userId);

    return {
      status: 'success',
      data: {
        id: user.UserID,
        username: user.Username,
        email: user.Email,
        fullName: user.FullName,
        employeeId: user.EmployeeID,
        roles,
        permissions,
      },
    };
  }

  async forgotPassword(email: string) {
    await this.ensureUserSchema();

    const user = await this.userRepo.findOne({ where: { Email: email } });
    if (!user || !user.IsActive) {
      return {
        status: 'success',
        message: 'Náº¿u email tá»“n táº¡i, token Ä‘áº·t láº¡i máº­t kháº©u Ä‘Ã£ Ä‘Æ°á»£c táº¡o',
      };
    }

    const token = randomUUID();
    const expiry = new Date(Date.now() + 30 * 60 * 1000);
    user.ResetPasswordToken = token;
    user.ResetPasswordExpiry = expiry;
    await this.userRepo.save(user);

    // Dev mode: log token so testers can finish the flow without mail service.
    console.log(`[forgot-password] ${user.Email}: ${token}`);

    return {
      status: 'success',
      message: 'Token Ä‘áº·t láº¡i máº­t kháº©u Ä‘Ã£ Ä‘Æ°á»£c táº¡o',
      data: { token, expiresAt: expiry.toISOString() },
    };
  }

  async resetPassword(token: string, newPassword: string) {
    await this.ensureUserSchema();

    if (!token || !newPassword) {
      throw new BadRequestException('Token vÃ  máº­t kháº©u má»›i lÃ  báº¯t buá»™c');
    }

    const user = await this.userRepo.findOne({ where: { ResetPasswordToken: token } });
    if (!user || !user.ResetPasswordExpiry || user.ResetPasswordExpiry.getTime() < Date.now()) {
      throw new BadRequestException('Token khÃ´ng há»£p lá»‡ hoáº·c Ä‘Ã£ háº¿t háº¡n');
    }

    user.PasswordHash = hashPassword(newPassword);
    user.ResetPasswordToken = null;
    user.ResetPasswordExpiry = null;
    await this.userRepo.save(user);

    return { status: 'success', message: 'Äáº·t láº¡i máº­t kháº©u thÃ nh cÃ´ng' };
  }

  private async ensureUserSchema() {
    if (this.userSchemaReady) return;

    await this.addColumnIfMissing(
      'users',
      'ResetPasswordToken',
      'VARCHAR(100) NULL',
    );
    await this.addColumnIfMissing(
      'users',
      'ResetPasswordExpiry',
      'DATETIME NULL',
    );

    this.userSchemaReady = true;
  }

  private async addColumnIfMissing(
    tableName: string,
    columnName: string,
    definition: string,
  ) {
    const rows: Array<{ COLUMN_NAME: string }> = await this.userRepo.query(
      `
        SELECT COLUMN_NAME
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = ?
          AND column_name = ?
      `,
      [tableName, columnName],
    );

    if (rows.length === 0) {
      await this.userRepo.query(
        `ALTER TABLE \`${tableName}\` ADD COLUMN \`${columnName}\` ${definition}`,
      );
    }
  }
}
