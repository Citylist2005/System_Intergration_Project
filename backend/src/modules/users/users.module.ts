import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../database/payroll/entities/user.entity';
import { Role } from '../../database/payroll/entities/role.entity';
import { UserRole } from '../../database/payroll/entities/user-role.entity';
import { Permission } from '../../database/payroll/entities/permission.entity';
import { RolePermission } from '../../database/payroll/entities/role-permission.entity';
import { RbacController, UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, UserRole, Permission, RolePermission], 'payrollConnection')],
  controllers: [UsersController, RbacController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
