import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('system_backups')
export class SystemBackup {
  @PrimaryGeneratedColumn()
  BackupID: number;

  @Column({ type: 'varchar', length: 30, default: 'Manual' })
  BackupType: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  BackupName: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  FilePath: string;

  @Column({ type: 'bigint', nullable: true })
  FileSize: number;

  @Column({ type: 'varchar', length: 20, default: 'Running' })
  Status: string;

  @CreateDateColumn()
  StartedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  CompletedAt: Date;

  @Column({ nullable: true })
  Duration: number;

  @Column({ nullable: true })
  CreatedBy: number;

  @Column({ type: 'datetime', nullable: true })
  RestoredAt: Date | null;

  @Column({ type: 'int', nullable: true })
  RestoredBy: number | null;

  @Column({ type: 'text', nullable: true })
  Notes: string;
}
