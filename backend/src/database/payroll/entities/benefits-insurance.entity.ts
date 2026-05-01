import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('benefits_insurance')
export class BenefitsInsurance {
  @PrimaryGeneratedColumn()
  BenefitID: number;

  @Column()
  EmployeeID: number;

  @Column({ type: 'varchar', length: 80 })
  BenefitType: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  Provider: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  PolicyNumber: string;

  @Column({ type: 'date', nullable: true })
  StartDate: Date;

  @Column({ type: 'date', nullable: true })
  EndDate: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  MonthlyCost: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  EmployerShare: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  EmployeeShare: number;

  @Column({ type: 'varchar', length: 20, default: 'Active' })
  Status: string;

  @Column({ type: 'text', nullable: true })
  Notes: string;

  @CreateDateColumn()
  CreatedAt: Date;

  @UpdateDateColumn()
  UpdatedAt: Date;
}
