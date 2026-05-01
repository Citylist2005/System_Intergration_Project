import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { PaginationQueryDto } from '../../../common/pagination-query.dto';

export class AttendanceQueryDto extends PaginationQueryDto {
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

export class AttendanceSummaryQueryDto {
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
