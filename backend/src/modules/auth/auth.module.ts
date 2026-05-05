import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../database/payroll/entities/user.entity';
import { Role } from '../../database/payroll/entities/role.entity';
import { Permission } from '../../database/payroll/entities/permission.entity';
import { UserRole } from '../../database/payroll/entities/user-role.entity';
import { RolePermission } from '../../database/payroll/entities/role-permission.entity';
import { AuthGuard } from './auth.guard';
import { RolesGuard } from './roles.guard';
import { PermissionsGuard } from './permissions.guard';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthTokenService } from './auth-token.service';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [User, Role, Permission, UserRole, RolePermission],
      'payrollConnection',
    ),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthTokenService,
    // Guard order matters: JWT → Roles → Permissions
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
  exports: [AuthTokenService, TypeOrmModule],
})
export class AuthModule {}
