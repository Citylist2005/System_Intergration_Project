import { IsInt, IsNumber, Max, Min } from 'class-validator';

export class UpsertPayrollDto {
  @IsInt()
  @Min(1)
  employeeId: number;

  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @IsInt()
  @Min(2000)
  @Max(2100)
  year: number;

  @IsNumber()
  @Min(0)
  baseSalary: number;

  @IsNumber()
  @Min(0)
  bonus: number;

  @IsNumber()
  @Min(0)
  deductions: number;
}

export class UpdatePayrollDto {
  @IsNumber()
  @Min(0)
  baseSalary: number;

  @IsNumber()
  @Min(0)
  bonus: number;

  @IsNumber()
  @Min(0)
  deductions: number;
}
