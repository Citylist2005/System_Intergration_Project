import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  LogID: number;

  @Column({ nullable: true })
  UserID: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  Username: string;

  @Column({ type: 'varchar', length: 100 })
  Action: string;

  @Column({ type: 'varchar', length: 80, nullable: true })
  EntityType: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  EntityID: string;

  @Column({ type: 'json', nullable: true })
  OldValues: unknown;

  @Column({ type: 'json', nullable: true })
  NewValues: unknown;

  @Column({ type: 'varchar', length: 45, nullable: true })
  IPAddress: string;

  @CreateDateColumn()
  CreatedAt: Date;
}
