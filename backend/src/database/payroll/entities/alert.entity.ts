import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('alerts')
@Index('idx_alerts_employee', ['EmployeeID'])
@Index('idx_alerts_type', ['AlertType'])
@Index('idx_alerts_unread', ['IsRead'])
export class Alert {
  @PrimaryGeneratedColumn()
  AlertID: number;

  @Column({ type: 'varchar', length: 50 })
  AlertType: string;

  @Column({ nullable: true })
  EmployeeID: number;

  @Column({ type: 'varchar', length: 200 })
  Title: string;

  @Column({ type: 'text', nullable: true })
  Message: string;

  @Column({ type: 'tinyint', default: 0 })
  IsRead: boolean;

  @Column({ type: 'tinyint', default: 1 })
  IsActive: boolean;

  @Column({ type: 'date', nullable: true })
  TriggerDate: Date;

  @CreateDateColumn()
  CreatedAt: Date;
}
