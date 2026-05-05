import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PitTaxBracket } from '../../database/payroll/entities/pit-tax-bracket.entity';
import { PitTaxService } from './pit-tax.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PitTaxBracket], 'payrollConnection'),
  ],
  providers: [PitTaxService],
  exports: [PitTaxService],
})
export class TaxModule {}
