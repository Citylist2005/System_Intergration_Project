import { IsIn, IsInt, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { EMPLOYEE_STATUS_OPTIONS } from '../../../common/employee-status';

export class CreateEmployeeDto {
  @IsInt()
  EmployeeID: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  FullName: string;

  @IsInt()
  DepartmentID: number;

  @IsInt()
  PositionID: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @IsIn(EMPLOYEE_STATUS_OPTIONS)
  Status: string;
}
