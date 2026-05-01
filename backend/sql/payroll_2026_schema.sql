CREATE DATABASE IF NOT EXISTS payroll_2026
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE payroll_2026;

CREATE TABLE IF NOT EXISTS departments_payroll (
  DepartmentID INT NOT NULL,
  DepartmentName VARCHAR(100) NOT NULL,
  SyncedAt DATETIME NULL,
  PRIMARY KEY (DepartmentID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS positions_payroll (
  PositionID INT NOT NULL,
  PositionName VARCHAR(100) NOT NULL,
  SyncedAt DATETIME NULL,
  PRIMARY KEY (PositionID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS employees_payroll (
  EmployeeID INT NOT NULL,
  FullName VARCHAR(100) NULL,
  DepartmentID INT NULL,
  PositionID INT NULL,
  Status VARCHAR(20) NOT NULL DEFAULT 'Active',
  SyncedAt DATETIME NULL,
  PRIMARY KEY (EmployeeID),
  INDEX idx_employees_payroll_department (DepartmentID),
  INDEX idx_employees_payroll_position (PositionID),
  INDEX idx_employees_payroll_status (Status),
  CONSTRAINT fk_employees_payroll_department
    FOREIGN KEY (DepartmentID) REFERENCES departments_payroll (DepartmentID)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_employees_payroll_position
    FOREIGN KEY (PositionID) REFERENCES positions_payroll (PositionID)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS attendance (
  AttendanceID INT NOT NULL AUTO_INCREMENT,
  EmployeeID INT NOT NULL,
  WorkDays INT NOT NULL DEFAULT 0,
  AbsentDays INT NOT NULL DEFAULT 0,
  LeaveDays INT NOT NULL DEFAULT 0,
  AttendanceMonth DATE NOT NULL,
  CreatedAt DATETIME NULL,
  PRIMARY KEY (AttendanceID),
  UNIQUE KEY ux_attendance_employee_month (EmployeeID, AttendanceMonth),
  INDEX idx_attendance_month (AttendanceMonth),
  CONSTRAINT fk_attendance_employee
    FOREIGN KEY (EmployeeID) REFERENCES employees_payroll (EmployeeID)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS salaries (
  SalaryID INT NOT NULL AUTO_INCREMENT,
  EmployeeID INT NOT NULL,
  SalaryMonth DATE NOT NULL,
  BaseSalary DECIMAL(15, 2) NULL DEFAULT 0,
  Bonus DECIMAL(15, 2) NULL DEFAULT 0,
  Deductions DECIMAL(15, 2) NULL DEFAULT 0,
  NetSalary DECIMAL(15, 2) NULL DEFAULT 0,
  CreatedAt DATETIME NULL,
  PRIMARY KEY (SalaryID),
  UNIQUE KEY ux_salaries_employee_month (EmployeeID, SalaryMonth),
  INDEX idx_salaries_month (SalaryMonth),
  CONSTRAINT fk_salaries_employee
    FOREIGN KEY (EmployeeID) REFERENCES employees_payroll (EmployeeID)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
