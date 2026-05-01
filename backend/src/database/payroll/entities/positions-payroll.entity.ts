import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('positions_payroll')
export class PayrollPosition {
  @PrimaryColumn()
  PositionID: number;

  @Column({ type: 'varchar', length: 100 })
  PositionName: string;

  @Column({ type: 'datetime', nullable: true })
  SyncedAt: Date;
}
