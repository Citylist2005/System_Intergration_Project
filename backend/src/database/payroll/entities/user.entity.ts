import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

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

  @Column({ type: 'varchar', length: 30, default: 'Employee' })
  Role: string;

  @Column({ nullable: true })
  EmployeeID: number;

  @Column({ type: 'tinyint', default: 1 })
  IsActive: boolean;

  @Column({ type: 'datetime', nullable: true })
  LastLoginAt: Date;

  @CreateDateColumn()
  CreatedAt: Date;

  @UpdateDateColumn()
  UpdatedAt: Date;
}
