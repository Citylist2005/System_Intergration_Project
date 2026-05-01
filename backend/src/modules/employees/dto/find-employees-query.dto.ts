import { IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { PaginationQueryDto } from '../../../common/pagination-query.dto';
import { EMPLOYEE_STATUS_OPTIONS } from '../../../common/employee-status';

export class FindEmployeesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  departmentId?: number;

  @IsOptional()
  @IsString()
  @IsIn(EMPLOYEE_STATUS_OPTIONS)
  status?: string;
}
