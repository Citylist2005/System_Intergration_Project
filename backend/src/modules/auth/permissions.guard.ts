import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from './permissions.decorator';
import { IS_PUBLIC_KEY } from './public.decorator';
import { TokenPayload } from './auth-token.service';

interface RequestWithUser extends Request {
  user?: TokenPayload & { permissions?: string[] };
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Skip public routes
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No permission annotation → allow through (roles guard handles role checks)
    if (!requiredPermissions?.length) return true;

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) return false;

    // ADMIN role bypasses all permission checks
    if (user.roles?.includes('ADMIN')) return true;

    const userPermissions: string[] = user.permissions ?? [];
    const hasAll = requiredPermissions.every((p) => userPermissions.includes(p));

    if (!hasAll) {
      throw new ForbiddenException(
        `Bạn không có quyền thực hiện thao tác này. Yêu cầu: ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }
}
