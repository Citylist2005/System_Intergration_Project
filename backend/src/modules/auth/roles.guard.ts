import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { IS_PUBLIC_KEY } from './public.decorator';
import { TokenPayload } from './auth-token.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles?.length) return true;

    const request = context.switchToHttp().getRequest<{ user?: TokenPayload }>();
    const userRoles: string[] = request.user?.roles ?? [];

    // ADMIN bypasses role restrictions
    if (userRoles.includes('ADMIN')) return true;

    const hasRole = requiredRoles.some((r) => userRoles.includes(r));
    if (!hasRole) {
      throw new ForbiddenException('Bạn không có vai trò cần thiết để thực hiện thao tác này');
    }

    return true;
  }
}
