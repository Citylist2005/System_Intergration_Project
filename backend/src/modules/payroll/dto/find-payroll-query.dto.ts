import { IsArray, IsInt, IsOptional, Max, Min } from 'class-validator';
import { PaginationQueryDto } from '../../../common/pagination-query.dto';

export class FindPayrollQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  employeeId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;

  @IsOptional()
  @IsInt()
  @Min(2000)
  @Max(2100)
  year?: number;
}

export class CalculatePayrollDto {
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @IsInt()
  @Min(2000)
  @Max(2100)
  year: number;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  employeeIds?: number[];
}
