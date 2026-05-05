import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from './user-role.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  UserID: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  Username: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  Email: string;

  @Column({ type: 'varchar', length: 255 })
  PasswordHash: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  FullName: string;

  /** Legacy single-role field kept for backward compat */
  @Column({ type: 'varchar', length: 30, default: 'Employee' })
  Role: string;

  @Column({ nullable: true })
  EmployeeID: number;

  @Column({ type: 'tinyint', default: 1 })
  IsActive: boolean;

  @Column({ type: 'datetime', nullable: true })
  LastLoginAt: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ResetPasswordToken: string | null;

  @Column({ type: 'datetime', nullable: true })
  ResetPasswordExpiry: Date | null;

  @CreateDateColumn()
  CreatedAt: Date;

  @UpdateDateColumn()
  UpdatedAt: Date;

  /** RBAC relations */
  @OneToMany(() => UserRole, (ur) => ur.user)
  userRoles: UserRole[];
}
