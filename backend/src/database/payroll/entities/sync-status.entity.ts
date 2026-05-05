import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('sync_status')
export class SyncStatus {
  @PrimaryGeneratedColumn()
  StatusID: number;

  @Column({ type: 'varchar', length: 30 })
  SyncType: string;

  @Column({ type: 'varchar', length: 20 })
  Status: string;

  @Column({ type: 'datetime', nullable: true })
  StartedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  CompletedAt: Date;

  @Column({ type: 'json', nullable: true })
  Details: Record<string, unknown>;

  @CreateDateColumn()
  CreatedAt: Date;
}
