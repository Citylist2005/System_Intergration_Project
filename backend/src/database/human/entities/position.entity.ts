import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('Positions')
export class HumanPosition {
  @PrimaryColumn()
  PositionID: number;

  @Column({ type: 'nvarchar', length: 100 })
  PositionName: string;

  @Column({ type: 'datetime', nullable: true })
  CreatedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  UpdatedAt: Date;
}
