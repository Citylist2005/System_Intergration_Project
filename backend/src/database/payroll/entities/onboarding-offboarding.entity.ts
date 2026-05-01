import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('onboarding_offboarding')
export class OnboardingOffboarding {
  @PrimaryGeneratedColumn()
  RecordID: number;

  @Column()
  EmployeeID: number;

  @Column({ type: 'varchar', length: 20 })
  ProcessType: string;

  @Column({ type: 'date', nullable: true })
  StartDate: Date;

  @Column({ type: 'date', nullable: true })
  TargetDate: Date;

  @Column({ type: 'date', nullable: true })
  CompletedDate: Date;

  @Column({ type: 'varchar', length: 20, default: 'InProgress' })
  Status: string;

  @Column({ type: 'json', nullable: true })
  ChecklistJSON: unknown;

  @Column({ nullable: true })
  AssignedTo: number;

  @Column({ type: 'text', nullable: true })
  Notes: string;

  @CreateDateColumn()
  CreatedAt: Date;

  @UpdateDateColumn()
  UpdatedAt: Date;
}
