const statusLabelMap = {
  Active: 'Đang làm việc',
  'On Leave': 'Nghỉ phép',
  Probation: 'Thử việc',
  Intern: 'Thực tập',
  Inactive: 'Ngừng hoạt động',
};

export function localizeStatusLabel(status) {
  return statusLabelMap[status] ?? 'Không xác định';
}

export function normalizeDepartmentLabel(departmentId) {
  return departmentId ? `Phòng ban ${departmentId}` : 'Chưa phân công';
}

export function enrichPayrollRows(payrollRows, employees) {
  const employeeMap = new Map(
    employees.map((employee) => [employee.EmployeeID, employee]),
  );

  return payrollRows.map((row) => {
    const employee = employeeMap.get(row.EmployeeID);

    return {
      ...row,
      DepartmentID: employee?.DepartmentID ?? null,
      DepartmentLabel: normalizeDepartmentLabel(employee?.DepartmentID),
      EmployeeStatus: employee?.Status ?? 'Unknown',
    };
  });
}

export function buildSalaryBreakdown(rows) {
  return rows.reduce(
    (accumulator, row) => ({
      base: accumulator.base + Number(row.BaseSalary ?? 0),
      bonus: accumulator.bonus + Number(row.Bonus ?? 0),
      deductions: accumulator.deductions + Number(row.Deductions ?? 0),
      net: accumulator.net + Number(row.NetSalary ?? 0),
    }),
    { base: 0, bonus: 0, deductions: 0, net: 0 },
  );
}

export function buildPayrollTrend(rows) {
  const grouped = rows.reduce((accumulator, row) => {
    const key = row.CreatedAt
      ? new Date(row.CreatedAt).toISOString().slice(0, 10)
      : row.SalaryMonth;
    const current = accumulator.get(key) ?? 0;
    accumulator.set(key, current + Number(row.NetSalary ?? 0));
    return accumulator;
  }, new Map());

  return Array.from(grouped.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((left, right) => left.label.localeCompare(right.label))
    .slice(-6);
}

export function buildSalaryByDepartment(rows) {
  const grouped = rows.reduce((accumulator, row) => {
    const key = row.DepartmentLabel ?? 'Chưa phân công';
    const current = accumulator.get(key) ?? 0;
    accumulator.set(key, current + Number(row.NetSalary ?? 0));
    return accumulator;
  }, new Map());

  return Array.from(grouped.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((left, right) => right.value - left.value);
}

export function buildEmployeeDistribution(employees) {
  const grouped = employees.reduce((accumulator, employee) => {
    const key = localizeStatusLabel(employee.Status);
    const current = accumulator.get(key) ?? 0;
    accumulator.set(key, current + 1);
    return accumulator;
  }, new Map());

  return Array.from(grouped.entries()).map(([label, value]) => ({ label, value }));
}

export function buildAlerts(payrollRows, attendanceSummary, threshold) {
  const salaryGrouped = payrollRows.reduce((accumulator, row) => {
    const list = accumulator.get(row.EmployeeID) ?? [];
    list.push(row);
    accumulator.set(row.EmployeeID, list);
    return accumulator;
  }, new Map());

  const alerts = [];

  salaryGrouped.forEach((entries, employeeId) => {
    const sorted = [...entries].sort(
      (left, right) =>
        new Date(left.CreatedAt ?? left.SalaryMonth).getTime() -
        new Date(right.CreatedAt ?? right.SalaryMonth).getTime(),
    );

    for (let index = 1; index < sorted.length; index += 1) {
      const previous = Number(sorted[index - 1].NetSalary ?? 0);
      const current = Number(sorted[index].NetSalary ?? 0);

      if (previous > 0) {
        const percentChange = ((current - previous) / previous) * 100;

        if (percentChange > 30) {
          alerts.push({
            id: `salary-${employeeId}-${index}`,
            type: 'Tăng lương',
            severity: percentChange > 60 ? 'high' : 'medium',
            employeeId,
            employeeName: sorted[index].FullName,
            summary: `Lương tăng ${Math.round(percentChange)}%`,
            detail: `Lương thực nhận thay đổi từ ${previous.toLocaleString('vi-VN')} lên ${current.toLocaleString('vi-VN')}.`,
          });
        }
      }
    }
  });

  attendanceSummary.forEach((row) => {
    const absentDays = Number(row.AbsentDays ?? 0);
    if (absentDays > threshold) {
      alerts.push({
        id: `attendance-${row.EmployeeID}`,
        type: 'Bất thường chấm công',
        severity: absentDays > threshold + 3 ? 'high' : 'medium',
        employeeId: row.EmployeeID,
        employeeName: row.FullName,
        summary: `Số ngày vắng vượt ngưỡng (${absentDays})`,
        detail: `${row.FullName} có ${absentDays} ngày vắng và ${row.LeaveDays} ngày nghỉ phép.`,
      });
    }
  });

  return alerts.sort((left, right) => {
    const severityScore = { high: 3, medium: 2, low: 1 };
    return severityScore[right.severity] - severityScore[left.severity];
  });
}
