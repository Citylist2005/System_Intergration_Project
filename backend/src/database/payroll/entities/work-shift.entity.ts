import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('work_shifts')
export class WorkShift {
  @PrimaryGeneratedColumn()
  ShiftID: number;

  @Column({ type: 'varchar', length: 100 })
  ShiftName: string;

  @Column({ type: 'time' })
  StartTime: string;

  @Column({ type: 'time' })
  EndTime: string;

  @Column({ type: 'int', default: 60 })
  BreakMinutes: number;

  @Column({ type: 'tinyint', default: 0 })
  IsNightShift: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  Description: string;

  @Column({ type: 'tinyint', default: 1 })
  IsActive: boolean;

  @CreateDateColumn()
  CreatedAt: Date;

  @UpdateDateColumn()
  UpdatedAt: Date;
}
