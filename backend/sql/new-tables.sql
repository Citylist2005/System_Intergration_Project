-- ============================================================
-- NEW TABLES FOR payroll_2026 (MySQL)
-- Run this script ONCE to create missing tables
-- Does NOT drop existing tables
-- ============================================================

-- UC.06: Work Shifts
CREATE TABLE IF NOT EXISTS work_shifts (
  ShiftID       INT AUTO_INCREMENT PRIMARY KEY,
  ShiftName     VARCHAR(100) NOT NULL,
  StartTime     TIME NOT NULL,
  EndTime       TIME NOT NULL,
  BreakMinutes  INT DEFAULT 60,
  IsNightShift  TINYINT(1) DEFAULT 0,
  Description   VARCHAR(255),
  IsActive      TINYINT(1) DEFAULT 1,
  CreatedAt     DATETIME DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- UC.06: Shift Assignments
CREATE TABLE IF NOT EXISTS shift_assignments (
  AssignmentID  INT AUTO_INCREMENT PRIMARY KEY,
  EmployeeID    INT NOT NULL,
  ShiftID       INT NOT NULL,
  EffectiveDate DATE NOT NULL,
  EndDate       DATE,
  CreatedBy     INT,
  CreatedAt     DATETIME DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_sa_employee (EmployeeID),
  INDEX idx_sa_shift (ShiftID)
);

-- UC.07: Leave Requests
CREATE TABLE IF NOT EXISTS leave_requests (
  LeaveID       INT AUTO_INCREMENT PRIMARY KEY,
  EmployeeID    INT NOT NULL,
  LeaveType     VARCHAR(50) NOT NULL COMMENT 'Annual,Sick,Maternity,Unpaid,Other',
  StartDate     DATE NOT NULL,
  EndDate       DATE NOT NULL,
  TotalDays     DECIMAL(5,1) NOT NULL DEFAULT 1,
  Reason        TEXT,
  Status        VARCHAR(20) DEFAULT 'Pending' COMMENT 'Pending,Approved,Rejected,Cancelled',
  ApprovedBy    INT,
  ApprovedAt    DATETIME,
  CreatedAt     DATETIME DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_lr_employee (EmployeeID),
  INDEX idx_lr_status (Status)
);

-- UC.07: Overtime Requests
CREATE TABLE IF NOT EXISTS overtime_requests (
  OvertimeID    INT AUTO_INCREMENT PRIMARY KEY,
  EmployeeID    INT NOT NULL,
  OvertimeDate  DATE NOT NULL,
  StartTime     TIME NOT NULL,
  EndTime       TIME NOT NULL,
  Hours         DECIMAL(5,2) NOT NULL,
  Reason        TEXT,
  OvertimeType  VARCHAR(30) DEFAULT 'Weekday' COMMENT 'Weekday,Weekend,Holiday',
  Status        VARCHAR(20) DEFAULT 'Pending' COMMENT 'Pending,Approved,Rejected,Cancelled',
  ApprovedBy    INT,
  ApprovedAt    DATETIME,
  CreatedAt     DATETIME DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_or_employee (EmployeeID),
  INDEX idx_or_date (OvertimeDate)
);

ALTER TABLE attendance
  ADD COLUMN IF NOT EXISTS OvertimeHours DECIMAL(6,2) DEFAULT 0;

-- UC.09: Salary Policies
CREATE TABLE IF NOT EXISTS salary_policies (
  PolicyID      INT AUTO_INCREMENT PRIMARY KEY,
  PolicyName    VARCHAR(150) NOT NULL,
  PolicyCode    VARCHAR(50) UNIQUE,
  BaseSalaryMin DECIMAL(15,2) DEFAULT 0,
  BaseSalaryMax DECIMAL(15,2),
  OvertimeRate  DECIMAL(5,2) DEFAULT 1.5 COMMENT 'multiplier e.g. 1.5x',
  HolidayRate   DECIMAL(5,2) DEFAULT 2.0,
  TaxRate       DECIMAL(5,2) DEFAULT 10.0 COMMENT 'percent',
  SocialIns     DECIMAL(5,2) DEFAULT 8.0 COMMENT 'percent employee',
  HealthIns     DECIMAL(5,2) DEFAULT 1.5 COMMENT 'percent employee',
  UnemployIns   DECIMAL(5,2) DEFAULT 1.0 COMMENT 'percent employee',
  EffectiveDate DATE,
  ExpiryDate    DATE,
  IsActive      TINYINT(1) DEFAULT 1,
  Description   TEXT,
  CreatedAt     DATETIME DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- UC.11: Benefits & Insurance
CREATE TABLE IF NOT EXISTS benefits_insurance (
  BenefitID     INT AUTO_INCREMENT PRIMARY KEY,
  EmployeeID    INT NOT NULL,
  BenefitType   VARCHAR(80) NOT NULL COMMENT 'Health,Social,Unemployment,Dental,Life,Other',
  Provider      VARCHAR(150),
  PolicyNumber  VARCHAR(100),
  StartDate     DATE,
  EndDate       DATE,
  MonthlyCost   DECIMAL(15,2) DEFAULT 0,
  EmployerShare DECIMAL(15,2) DEFAULT 0,
  EmployeeShare DECIMAL(15,2) DEFAULT 0,
  Status        VARCHAR(20) DEFAULT 'Active' COMMENT 'Active,Expired,Cancelled',
  Notes         TEXT,
  CreatedAt     DATETIME DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_bi_employee (EmployeeID)
);

-- UC.12: Payroll Adjustments
CREATE TABLE IF NOT EXISTS payroll_adjustments (
  AdjustmentID  INT AUTO_INCREMENT PRIMARY KEY,
  EmployeeID    INT NOT NULL,
  SalaryMonth   DATE NOT NULL COMMENT 'First day of month',
  AdjustType    VARCHAR(50) NOT NULL COMMENT 'Bonus,Deduction,Allowance,Commission',
  Amount        DECIMAL(15,2) NOT NULL,
  Reason        TEXT,
  ApprovedBy    INT,
  Status        VARCHAR(20) DEFAULT 'Pending' COMMENT 'Pending,Approved,Applied,Rejected',
  CreatedAt     DATETIME DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_pa_employee (EmployeeID),
  INDEX idx_pa_month (SalaryMonth)
);

-- UC.02 / UC.04: Employee Lifecycle
CREATE TABLE IF NOT EXISTS employee_lifecycle (
  LifecycleID   INT AUTO_INCREMENT PRIMARY KEY,
  EmployeeID    INT NOT NULL,
  EventType     VARCHAR(80) NOT NULL COMMENT 'Hired,Promoted,Transferred,OnLeave,Terminated,Rehired',
  EventDate     DATE NOT NULL,
  FromPosition  VARCHAR(150),
  ToPosition    VARCHAR(150),
  FromDept      VARCHAR(150),
  ToDept        VARCHAR(150),
  Notes         TEXT,
  CreatedBy     INT,
  CreatedAt     DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_el_employee (EmployeeID)
);

-- UC.04: Onboarding / Offboarding
CREATE TABLE IF NOT EXISTS onboarding_offboarding (
  RecordID      INT AUTO_INCREMENT PRIMARY KEY,
  EmployeeID    INT NOT NULL,
  ProcessType   VARCHAR(20) NOT NULL COMMENT 'Onboarding,Offboarding',
  StartDate     DATE,
  TargetDate    DATE,
  CompletedDate DATE,
  Status        VARCHAR(20) DEFAULT 'InProgress' COMMENT 'InProgress,Completed,Cancelled',
  ChecklistJSON JSON COMMENT 'Array of checklist items with completion flags',
  AssignedTo    INT,
  Notes         TEXT,
  CreatedAt     DATETIME DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_oo_employee (EmployeeID)
);

-- UC.13: KPI / OKR
CREATE TABLE IF NOT EXISTS kpi_okr (
  KpiID         INT AUTO_INCREMENT PRIMARY KEY,
  EmployeeID    INT NOT NULL,
  Period        VARCHAR(20) NOT NULL COMMENT 'e.g. 2025-Q1, 2025-H1, 2025',
  PeriodType    VARCHAR(10) DEFAULT 'Quarterly' COMMENT 'Monthly,Quarterly,HalfYear,Yearly',
  Title         VARCHAR(255) NOT NULL,
  Description   TEXT,
  TargetValue   DECIMAL(10,2),
  ActualValue   DECIMAL(10,2),
  Weight        DECIMAL(5,2) DEFAULT 100 COMMENT 'percentage weight',
  Score         DECIMAL(5,2) COMMENT 'calculated score 0-100',
  BonusAmount   DECIMAL(15,2) DEFAULT 0 COMMENT 'approved KPI bonus used by payroll',
  Status        VARCHAR(20) DEFAULT 'Active' COMMENT 'Active,Completed,Cancelled',
  CreatedBy     INT,
  CreatedAt     DATETIME DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_kpi_employee (EmployeeID),
  INDEX idx_kpi_period (Period)
);

ALTER TABLE kpi_okr
  ADD COLUMN IF NOT EXISTS BonusAmount DECIMAL(15,2) DEFAULT 0 COMMENT 'approved KPI bonus used by payroll';

-- UC.14: Performance Reviews
CREATE TABLE IF NOT EXISTS performance_reviews (
  ReviewID      INT AUTO_INCREMENT PRIMARY KEY,
  EmployeeID    INT NOT NULL,
  ReviewPeriod  VARCHAR(20) NOT NULL,
  ReviewDate    DATE,
  ReviewerID    INT,
  OverallScore  DECIMAL(5,2),
  Competency    DECIMAL(5,2) COMMENT '0-5 scale',
  Attitude      DECIMAL(5,2),
  Teamwork      DECIMAL(5,2),
  Productivity  DECIMAL(5,2),
  Leadership    DECIMAL(5,2),
  Grade         VARCHAR(5) COMMENT 'A+,A,B+,B,C,D',
  Strengths     TEXT,
  Weaknesses    TEXT,
  Goals         TEXT,
  Status        VARCHAR(20) DEFAULT 'Draft' COMMENT 'Draft,Submitted,Approved,Rejected',
  CreatedAt     DATETIME DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_pr_employee (EmployeeID)
);

-- UC.20: Users (system users for RBAC)
CREATE TABLE IF NOT EXISTS users (
  UserID        INT AUTO_INCREMENT PRIMARY KEY,
  Username      VARCHAR(100) UNIQUE NOT NULL,
  Email         VARCHAR(150) UNIQUE NOT NULL,
  PasswordHash  VARCHAR(255) NOT NULL,
  FullName      VARCHAR(150),
  Role          VARCHAR(30) DEFAULT 'Employee' COMMENT 'Admin,HR_Manager,Payroll_Manager,Employee',
  EmployeeID    INT COMMENT 'linked employee record',
  IsActive      TINYINT(1) DEFAULT 1,
  LastLoginAt   DATETIME,
  CreatedAt     DATETIME DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- UC.23: System Backups
CREATE TABLE IF NOT EXISTS system_backups (
  BackupID      INT AUTO_INCREMENT PRIMARY KEY,
  BackupType    VARCHAR(30) DEFAULT 'Manual' COMMENT 'Manual,Scheduled,Auto',
  BackupName    VARCHAR(255),
  FilePath      VARCHAR(500),
  FileSize      BIGINT COMMENT 'bytes',
  Status        VARCHAR(20) DEFAULT 'Running' COMMENT 'Running,Completed,Failed',
  StartedAt     DATETIME DEFAULT CURRENT_TIMESTAMP,
  CompletedAt   DATETIME,
  Duration      INT COMMENT 'seconds',
  CreatedBy     INT,
  Notes         TEXT
);

ALTER TABLE system_backups
  ADD COLUMN IF NOT EXISTS RestoredAt DATETIME NULL,
  ADD COLUMN IF NOT EXISTS RestoredBy INT NULL;

-- PIT Tax Brackets
CREATE TABLE IF NOT EXISTS pit_tax_brackets (
  BracketID     INT AUTO_INCREMENT PRIMARY KEY,
  EffectiveDate DATE NOT NULL,
  MinIncome     DECIMAL(15,2) NOT NULL DEFAULT 0,
  MaxIncome     DECIMAL(15,2) NULL,
  Rate          DECIMAL(5,2) NOT NULL,
  Deduction     DECIMAL(15,2) NOT NULL DEFAULT 0,
  IsActive      TINYINT(1) DEFAULT 1,
  CreatedAt     DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT IGNORE INTO pit_tax_brackets (EffectiveDate, MinIncome, MaxIncome, Rate, Deduction) VALUES
('2024-01-01', 0,        5000000,  5, 0),
('2024-01-01', 5000000,  10000000, 10, 250000),
('2024-01-01', 10000000, 18000000, 15, 750000),
('2024-01-01', 18000000, 32000000, 20, 1650000),
('2024-01-01', 32000000, 52000000, 25, 3250000),
('2024-01-01', 52000000, 80000000, 30, 5850000),
('2024-01-01', 80000000, NULL,     35, 9850000);

-- Sync status history
CREATE TABLE IF NOT EXISTS sync_status (
  StatusID    INT AUTO_INCREMENT PRIMARY KEY,
  SyncType    VARCHAR(30) NOT NULL,
  Status      VARCHAR(20) NOT NULL,
  StartedAt   DATETIME,
  CompletedAt DATETIME,
  Details     JSON,
  CreatedAt   DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- HR alerts
CREATE TABLE IF NOT EXISTS alerts (
  AlertID     INT AUTO_INCREMENT PRIMARY KEY,
  AlertType   VARCHAR(50) NOT NULL,
  EmployeeID  INT NULL,
  Title       VARCHAR(200) NOT NULL,
  Message     TEXT,
  IsRead      TINYINT(1) DEFAULT 0,
  IsActive    TINYINT(1) DEFAULT 1,
  TriggerDate DATE,
  CreatedAt   DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_alerts_employee (EmployeeID),
  INDEX idx_alerts_type (AlertType),
  INDEX idx_alerts_unread (IsRead)
);

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS ResetPasswordToken VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS ResetPasswordExpiry DATETIME NULL;

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  LogID         INT AUTO_INCREMENT PRIMARY KEY,
  UserID        INT,
  Username      VARCHAR(100),
  Action        VARCHAR(100) NOT NULL COMMENT 'CREATE,UPDATE,DELETE,LOGIN,EXPORT,BACKUP',
  EntityType    VARCHAR(80) COMMENT 'Employee,Payroll,SalaryPolicy,User,Backup,KPI,Performance',
  EntityID      VARCHAR(50),
  OldValues     JSON,
  NewValues     JSON,
  IPAddress     VARCHAR(45),
  CreatedAt     DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_al_user (UserID),
  INDEX idx_al_entity (EntityType, EntityID),
  INDEX idx_al_created (CreatedAt)
);

-- Seed default admin user (password: Admin@123 bcrypt hashed)
INSERT IGNORE INTO users (Username, Email, PasswordHash, FullName, Role, IsActive)
VALUES (
  'admin',
  'admin@docusync.local',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', -- password: password
  'Quản trị viên',
  'Admin',
  1
);
