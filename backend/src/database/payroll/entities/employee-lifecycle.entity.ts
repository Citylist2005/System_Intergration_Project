import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('employee_lifecycle')
export class EmployeeLifecycle {
  @PrimaryGeneratedColumn()
  LifecycleID: number;

  @Column()
  EmployeeID: number;

  @Column({ type: 'varchar', length: 80 })
  EventType: string;

  @Column({ type: 'date' })
  EventDate: Date;

  @Column({ type: 'varchar', length: 150, nullable: true })
  FromPosition: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  ToPosition: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  FromDept: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  ToDept: string;

  @Column({ type: 'text', nullable: true })
  Notes: string;

  @Column({ nullable: true })
  CreatedBy: number;

  @CreateDateColumn()
  CreatedAt: Date;
}
