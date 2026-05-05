import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AuthTokenService, TokenPayload } from './auth-token.service';
import { IS_PUBLIC_KEY } from './public.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '../../database/payroll/entities/user-role.entity';
import { User } from '../../database/payroll/entities/user.entity';
import { ROLE_PERMISSION_MAP, normalizeRoleName } from './rbac-defaults';

interface RequestWithUser extends Request {
  user?: TokenPayload & { permissions: string[] };
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authTokenService: AuthTokenService,
    @InjectRepository(UserRole, 'payrollConnection')
    private readonly userRoleRepo: Repository<UserRole>,
    @InjectRepository(User, 'payrollConnection')
    private readonly userRepo: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = this.extractBearerToken(request);

    const payload = this.authTokenService.verify(token);

    // Load fresh roles/permissions from DB for each request.
    // Falls back to legacy users.Role so HR/Payroll/Employee accounts keep working
    // even when the RBAC mapping table has not been seeded yet.
    const { roles, permissions } = await this.loadRolesAndPermissions(payload.sub);

    request.user = { ...payload, roles, permissions };

    return true;
  }

  private async loadRolesAndPermissions(
    userId: number,
  ): Promise<{ roles: string[]; permissions: string[] }> {
    try {
      const userRoles = await this.userRoleRepo.find({
        where: { userId },
        relations: ['role', 'role.rolePermissions', 'role.rolePermissions.permission'],
      });

      const roles: string[] = [];
      const permSet = new Set<string>();
      for (const ur of userRoles) {
        if (ur.role?.name) roles.push(ur.role.name);
        for (const rp of ur.role?.rolePermissions ?? []) {
          if (rp.permission?.name) permSet.add(rp.permission.name);
        }
      }

      if (roles.length > 0) {
        return { roles, permissions: Array.from(permSet) };
      }
    } catch {
      // Continue to legacy fallback below.
    }

    const user = await this.userRepo.findOne({ where: { UserID: userId } });
    const legacyRole = normalizeRoleName(user?.Role);
    if (!legacyRole) {
      return { roles: [], permissions: [] };
    }

    return {
      roles: [legacyRole],
      permissions: ROLE_PERMISSION_MAP[legacyRole] ?? [],
    };
  }

  private extractBearerToken(request: Request) {
    const header = request.headers.authorization;
    const [scheme, token] = header?.split(' ') ?? [];

    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Thiếu token đăng nhập');
    }

    return token;
  }
}
