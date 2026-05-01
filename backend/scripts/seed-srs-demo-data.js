const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');

  if (!fs.existsSync(envPath)) {
    return {};
  }

  return Object.fromEntries(
    fs
      .readFileSync(envPath, 'utf8')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => {
        const index = line.indexOf('=');
        return [line.slice(0, index), line.slice(index + 1)];
      }),
  );
}

async function tableIsEmpty(connection, tableName) {
  const [rows] = await connection.query(`SELECT COUNT(*) AS total FROM ${tableName}`);
  return Number(rows[0]?.total ?? 0) === 0;
}

async function insertIfEmpty(connection, tableName, sql, params = []) {
  if (await tableIsEmpty(connection, tableName)) {
    await connection.query(sql, params);
    console.log(`Seeded ${tableName}`);
  } else {
    console.log(`Skipped ${tableName}: already has data`);
  }
}

async function main() {
  const env = loadEnv();
  const connection = await mysql.createConnection({
    host: env.PAYROLL_DB_HOST || 'localhost',
    port: Number(env.PAYROLL_DB_PORT || 3306),
    user: env.PAYROLL_DB_USER || 'root',
    password: env.PAYROLL_DB_PASS || '',
    database: env.PAYROLL_DB_NAME || 'payroll_2026',
    multipleStatements: true,
  });

  try {
    await insertIfEmpty(
      connection,
      'work_shifts',
      `
        INSERT INTO work_shifts
          (ShiftName, StartTime, EndTime, BreakMinutes, IsNightShift, Description, IsActive)
        VALUES
          ('Ca hành chính', '08:00:00', '17:00:00', 60, 0, 'Ca làm việc văn phòng tiêu chuẩn', 1),
          ('Ca sáng', '06:00:00', '14:00:00', 45, 0, 'Ca vận hành buổi sáng', 1),
          ('Ca tối', '14:00:00', '22:00:00', 45, 1, 'Ca vận hành buổi tối', 1)
      `,
    );

    await insertIfEmpty(
      connection,
      'shift_assignments',
      `
        INSERT INTO shift_assignments
          (EmployeeID, ShiftID, EffectiveDate, EndDate, CreatedBy)
        VALUES
          (1, 1, '2026-05-01', NULL, 1),
          (2, 1, '2026-05-01', NULL, 1),
          (3, 2, '2026-05-01', NULL, 1),
          (4, 3, '2026-05-01', NULL, 1)
      `,
    );

    await insertIfEmpty(
      connection,
      'leave_requests',
      `
        INSERT INTO leave_requests
          (EmployeeID, LeaveType, StartDate, EndDate, TotalDays, Reason, Status, ApprovedBy, ApprovedAt)
        VALUES
          (2, 'Annual', '2026-05-06', '2026-05-07', 2, 'Nghỉ phép cá nhân', 'Approved', 1, NOW()),
          (5, 'Sick', '2026-05-03', '2026-05-03', 1, 'Nghỉ ốm', 'Pending', NULL, NULL),
          (3, 'Unpaid', '2026-05-12', '2026-05-12', 1, 'Việc gia đình', 'Rejected', 1, NOW())
      `,
    );

    await insertIfEmpty(
      connection,
      'overtime_requests',
      `
        INSERT INTO overtime_requests
          (EmployeeID, OvertimeDate, StartTime, EndTime, Hours, Reason, OvertimeType, Status, ApprovedBy, ApprovedAt)
        VALUES
          (1, '2026-05-04', '17:30:00', '19:30:00', 2, 'Hoàn tất báo cáo tháng', 'Weekday', 'Approved', 1, NOW()),
          (3, '2026-05-09', '08:00:00', '12:00:00', 4, 'Hỗ trợ vận hành cuối tuần', 'Weekend', 'Pending', NULL, NULL)
      `,
    );

    await insertIfEmpty(
      connection,
      'employee_lifecycle',
      `
        INSERT INTO employee_lifecycle
          (EmployeeID, EventType, EventDate, FromPosition, ToPosition, FromDept, ToDept, Notes, CreatedBy)
        VALUES
          (1, 'Hired', '2025-01-10', NULL, 'Nhân viên HR', NULL, 'Nhân sự', 'Tuyển dụng đầu năm', 1),
          (2, 'Promoted', '2026-04-01', 'Chuyên viên', 'Trưởng nhóm', 'Kế toán', 'Kế toán', 'Thăng chức sau đánh giá Q1', 1),
          (4, 'Transferred', '2026-03-15', 'Nhân viên', 'Nhân viên', 'Vận hành', 'Nhân sự', 'Điều chuyển nội bộ', 1)
      `,
    );

    await insertIfEmpty(
      connection,
      'onboarding_offboarding',
      `
        INSERT INTO onboarding_offboarding
          (EmployeeID, ProcessType, StartDate, TargetDate, CompletedDate, Status, ChecklistJSON, AssignedTo, Notes)
        VALUES
          (1, 'Onboarding', '2025-01-10', '2025-01-17', '2025-01-16', 'Completed', JSON_ARRAY('Tạo tài khoản', 'Bàn giao thiết bị', 'Đào tạo nội quy'), 1, 'Hoàn tất đúng hạn'),
          (5, 'Offboarding', '2026-05-01', '2026-05-15', NULL, 'InProgress', JSON_ARRAY('Thu hồi thiết bị', 'Khóa tài khoản', 'Chốt công nợ'), 1, 'Đang xử lý')
      `,
    );

    await insertIfEmpty(
      connection,
      'salary_policies',
      `
        INSERT INTO salary_policies
          (PolicyName, PolicyCode, BaseSalaryMin, BaseSalaryMax, OvertimeRate, HolidayRate, TaxRate, SocialIns, HealthIns, UnemployIns, EffectiveDate, IsActive, Description)
        VALUES
          ('Chính sách lương văn phòng 2026', 'OFFICE-2026', 8000000, 30000000, 1.5, 2.0, 10, 8, 1.5, 1, '2026-01-01', 1, 'Áp dụng cho nhân viên khối văn phòng'),
          ('Chính sách vận hành ca', 'SHIFT-2026', 7000000, 25000000, 1.7, 2.2, 10, 8, 1.5, 1, '2026-01-01', 1, 'Áp dụng cho nhân viên làm ca')
      `,
    );

    await insertIfEmpty(
      connection,
      'benefits_insurance',
      `
        INSERT INTO benefits_insurance
          (EmployeeID, BenefitType, Provider, PolicyNumber, StartDate, MonthlyCost, EmployerShare, EmployeeShare, Status, Notes)
        VALUES
          (1, 'Health', 'Bảo hiểm ABC', 'HI-001', '2026-01-01', 900000, 700000, 200000, 'Active', 'Gói sức khỏe tiêu chuẩn'),
          (2, 'Social', 'BHXH Việt Nam', 'SI-002', '2026-01-01', 1200000, 900000, 300000, 'Active', 'Bảo hiểm xã hội'),
          (3, 'Life', 'Bảo hiểm XYZ', 'LI-003', '2026-02-01', 600000, 500000, 100000, 'Active', 'Bảo hiểm nhân thọ')
      `,
    );

    await insertIfEmpty(
      connection,
      'payroll_adjustments',
      `
        INSERT INTO payroll_adjustments
          (EmployeeID, SalaryMonth, AdjustType, Amount, Reason, ApprovedBy, Status)
        VALUES
          (1, '2026-05-01', 'Bonus', 1500000, 'Thưởng hoàn thành KPI', 1, 'Approved'),
          (2, '2026-05-01', 'Allowance', 800000, 'Phụ cấp trách nhiệm', 1, 'Approved'),
          (3, '2026-05-01', 'Deduction', 300000, 'Đi muộn trong kỳ', 1, 'Pending')
      `,
    );

    await insertIfEmpty(
      connection,
      'kpi_okr',
      `
        INSERT INTO kpi_okr
          (EmployeeID, Period, PeriodType, Title, Description, TargetValue, ActualValue, Weight, Score, Status, CreatedBy)
        VALUES
          (1, '2026-Q2', 'Quarterly', 'Tỷ lệ hoàn tất hồ sơ nhân sự', 'Hoàn tất hồ sơ đúng hạn', 100, 92, 40, 92, 'Active', 1),
          (2, '2026-Q2', 'Quarterly', 'Độ chính xác bảng lương', 'Giảm lỗi tính lương', 100, 96, 35, 96, 'Active', 1),
          (3, '2026-Q2', 'Quarterly', 'Tỷ lệ xử lý yêu cầu vận hành', 'Xử lý yêu cầu trong SLA', 100, 88, 25, 88, 'Active', 1)
      `,
    );

    await insertIfEmpty(
      connection,
      'performance_reviews',
      `
        INSERT INTO performance_reviews
          (EmployeeID, ReviewPeriod, ReviewDate, ReviewerID, OverallScore, Competency, Attitude, Teamwork, Productivity, Leadership, Grade, Strengths, Weaknesses, Goals, Status)
        VALUES
          (1, '2026-Q1', '2026-04-05', 1, 91, 4.5, 4.6, 4.4, 4.5, 4.0, 'A', 'Chủ động và ổn định', 'Cần cải thiện báo cáo phân tích', 'Nâng chất lượng báo cáo HR', 'Approved'),
          (2, '2026-Q1', '2026-04-06', 1, 94, 4.7, 4.5, 4.6, 4.8, 4.2, 'A+', 'Chính xác trong nghiệp vụ lương', 'Cần chia sẻ kiến thức nhiều hơn', 'Chuẩn hóa checklist tính lương', 'Submitted')
      `,
    );

    await insertIfEmpty(
      connection,
      'system_backups',
      `
        INSERT INTO system_backups
          (BackupType, BackupName, FilePath, FileSize, Status, StartedAt, CompletedAt, Duration, CreatedBy, Notes)
        VALUES
          ('Manual', 'backup-payroll-2026-05-01', 'D:/backups/payroll_2026_20260501.sql', 5242880, 'Completed', NOW(), NOW(), 18, 1, 'Bản sao lưu demo cho đồ án')
      `,
    );

    console.log('SRS demo seed completed.');
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
