import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PitTaxBracket } from '../../database/payroll/entities/pit-tax-bracket.entity';

/**
 * Hằng số giảm trừ gia cảnh (VND) theo Luật Thuế TNCN VN 2024.
 * Bản thân người nộp thuế: 11,000,000/tháng
 * Mỗi người phụ thuộc: 4,400,000/tháng
 */
export const PERSONAL_DEDUCTION_PER_MONTH = 11_000_000;
export const DEPENDENT_DEDUCTION_PER_MONTH = 4_400_000;

@Injectable()
export class PitTaxService {
  private readonly logger = new Logger(PitTaxService.name);

  constructor(
    @InjectDataSource('payrollConnection')
    private readonly payrollDataSource: DataSource,
    @InjectRepository(PitTaxBracket, 'payrollConnection')
    private readonly bracketRepo: Repository<PitTaxBracket>,
  ) {}

  /**
   * Lấy danh sách bậc thuế có hiệu lực tại thời điểm `forDate`.
   * Chọn EffectiveDate gần nhất không vượt quá `forDate`.
   */
  async getActiveBrackets(forDate: Date): Promise<PitTaxBracket[]> {
    await this.ensurePayrollConnection();
    await this.seedDefaultBrackets();

    // Tìm EffectiveDate mới nhất <= forDate
    const latestDate = await this.bracketRepo
      .createQueryBuilder('b')
      .select('MAX(b.EffectiveDate)', 'maxDate')
      .where('b.EffectiveDate <= :forDate', { forDate })
      .andWhere('b.IsActive = 1')
      .getRawOne<{ maxDate: string | null }>();

    if (!latestDate?.maxDate) {
      // Fallback: lấy bảng thuế mới nhất bất kể ngày
      const fallback = await this.bracketRepo.find({
        where: { IsActive: true },
        order: { EffectiveDate: 'DESC', MinIncome: 'ASC' },
      });
      return fallback;
    }

    return this.bracketRepo.find({
      where: { EffectiveDate: new Date(latestDate.maxDate), IsActive: true },
      order: { MinIncome: 'ASC' },
    });
  }

  /**
   * Tính PIT (thuế thu nhập cá nhân) theo phương pháp lũy tiến từng phần VN.
   *
   * Công thức rút gọn:
   *   - Xác định bậc (bracket) mà taxableIncome rơi vào
   *   - PIT = taxableIncome × Rate% - Deduction
   *
   * @param taxableIncome Thu nhập tính thuế (sau giảm trừ gia cảnh + BHXH)
   * @param forDate       Ngày tính (để chọn bảng thuế đúng kỳ)
   * @returns Số thuế TNCN (VND, làm tròn)
   */
  async calculatePIT(taxableIncome: number, forDate: Date): Promise<number> {
    await this.ensurePayrollConnection();

    if (taxableIncome <= 0) return 0;

    const brackets = await this.getActiveBrackets(forDate);
    if (!brackets.length) {
      this.logger.warn('Không tìm thấy bảng thuế PIT, bỏ qua tính thuế');
      return 0;
    }

    // Tìm bậc tương ứng
    const bracket = brackets.find((b) => {
      const min = Number(b.MinIncome);
      const max = b.MaxIncome === null ? Infinity : Number(b.MaxIncome);
      return taxableIncome > min && taxableIncome <= max;
    });

    if (!bracket) {
      // Nếu <= bậc thấp nhất (chưa đến ngưỡng chịu thuế)
      const minBracket = brackets[0];
      if (taxableIncome <= Number(minBracket.MinIncome)) return 0;
      // Sử dụng bậc cao nhất nếu vượt tất cả
      const topBracket = brackets[brackets.length - 1];
      const pit =
        taxableIncome * (Number(topBracket.Rate) / 100) -
        Number(topBracket.Deduction);
      return Math.max(0, Math.round(pit));
    }

    const pit =
      taxableIncome * (Number(bracket.Rate) / 100) -
      Number(bracket.Deduction);

    return Math.max(0, Math.round(pit));
  }

  /**
   * Tính thu nhập tính thuế (taxable income) theo công thức VN:
   *   TaxableIncome = GrossSalary - PersonalDeduction - DependentDeduction
   *                  - SocialInsurance - HealthInsurance - UnemployInsurance
   *
   * @param grossSalary      Thu nhập chịu thuế = baseSalary + bonus + allowances
   * @param dependentCount   Số người phụ thuộc (mặc định 0)
   * @param socialIns        BHXH (tính theo tỷ lệ hoặc số tiền cố định)
   * @param healthIns        BHYT
   * @param unemployIns      BH thất nghiệp
   */
  computeTaxableIncome(
    grossSalary: number,
    dependentCount = 0,
    socialIns = 0,
    healthIns = 0,
    unemployIns = 0,
  ): number {
    const deduction =
      PERSONAL_DEDUCTION_PER_MONTH +
      dependentCount * DEPENDENT_DEDUCTION_PER_MONTH +
      socialIns +
      healthIns +
      unemployIns;

    return Math.max(0, grossSalary - deduction);
  }

  // ─── Seed mặc định 7 bậc VN 2024 ──────────────────────────────────────────
  private async seedDefaultBrackets() {
    await this.ensurePayrollConnection();

    const count = await this.bracketRepo.count();
    if (count > 0) return; // Đã có dữ liệu → bỏ qua

    const effectiveDate = new Date('2024-01-01');
    const defaultBrackets = [
      { MinIncome: 0,          MaxIncome: 5_000_000,  Rate: 5,  Deduction: 0 },
      { MinIncome: 5_000_000,  MaxIncome: 10_000_000, Rate: 10, Deduction: 250_000 },
      { MinIncome: 10_000_000, MaxIncome: 18_000_000, Rate: 15, Deduction: 750_000 },
      { MinIncome: 18_000_000, MaxIncome: 32_000_000, Rate: 20, Deduction: 1_650_000 },
      { MinIncome: 32_000_000, MaxIncome: 52_000_000, Rate: 25, Deduction: 3_250_000 },
      { MinIncome: 52_000_000, MaxIncome: 80_000_000, Rate: 30, Deduction: 5_850_000 },
      { MinIncome: 80_000_000, MaxIncome: null,        Rate: 35, Deduction: 9_850_000 },
    ];

    await this.bracketRepo.save(
      defaultBrackets.map((b) =>
        this.bracketRepo.create({ ...b, EffectiveDate: effectiveDate, IsActive: true }),
      ),
    );

    this.logger.log('Đã seed 7 bậc thuế PIT VN 2024');
  }

  private async ensurePayrollConnection() {
    if (this.payrollDataSource.isInitialized) return;
    await this.payrollDataSource.initialize();
  }
}
