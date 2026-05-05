import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

/**
 * PIT (Personal Income Tax) bracket theo Luật Thuế TNCN VN (7 bậc).
 * Mỗi bậc có:
 *   - MinIncome / MaxIncome (null = không giới hạn trên)
 *   - Rate: % thuế áp dụng cho cả thu nhập tính thuế của bậc đó
 *   - Deduction: số tiền khấu trừ cố định để tính nhanh (công thức rút gọn VN)
 *     PIT = TaxableIncome × Rate% - Deduction
 *   - EffectiveDate: ngày bắt đầu áp dụng bảng lũy tiến này
 */
@Entity('pit_tax_brackets')
export class PitTaxBracket {
  @PrimaryGeneratedColumn()
  BracketID: number;

  /** Ngày áp dụng bảng thuế — dùng để chọn đúng bảng theo kỳ lương */
  @Column({ type: 'date' })
  EffectiveDate: Date;

  /** Thu nhập tính thuế tối thiểu của bậc (VND) */
  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  MinIncome: number;

  /** Thu nhập tính thuế tối đa của bậc (NULL = vô hạn) */
  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  MaxIncome: number | null;

  /** Thuế suất (%), ví dụ: 5, 10, 15, 20, 25, 30, 35 */
  @Column({ type: 'decimal', precision: 5, scale: 2 })
  Rate: number;

  /**
   * Số giảm trừ rút gọn (VND) theo công thức VN:
   *   PIT = TaxableIncome × Rate% - Deduction
   * Giúp tính nhanh mà không cần cộng dồn từng bậc.
   */
  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  Deduction: number;

  @Column({ type: 'tinyint', default: 1 })
  IsActive: boolean;

  @CreateDateColumn()
  CreatedAt: Date;
}
