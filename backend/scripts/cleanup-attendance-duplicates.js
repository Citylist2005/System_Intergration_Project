const mysql = require('mysql2/promise');

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.PAYROLL_DB_HOST || 'localhost',
    port: Number(process.env.PAYROLL_DB_PORT || 3306),
    user: process.env.PAYROLL_DB_USER || 'root',
    password: process.env.PAYROLL_DB_PASS || 'root',
    database: process.env.PAYROLL_DB_NAME || 'payroll_2026',
  });

  const [[before]] = await connection.query(`
    SELECT
      COUNT(*) AS totalRows,
      COUNT(DISTINCT AttendanceID) AS distinctAttendanceIds,
      COUNT(DISTINCT CONCAT(EmployeeID, '|', YEAR(AttendanceMonth), '|', MONTH(AttendanceMonth))) AS distinctEmployeeMonths
    FROM attendance
  `);

  console.log('Before cleanup:', before);

  const [result] = await connection.query(`
    DELETE a
    FROM attendance a
    INNER JOIN attendance b
      ON a.EmployeeID = b.EmployeeID
      AND a.WorkDays = b.WorkDays
      AND a.AbsentDays = b.AbsentDays
      AND a.LeaveDays = b.LeaveDays
      AND ABS(DATEDIFF(a.AttendanceMonth, b.AttendanceMonth)) <= 1
      AND (
        a.AttendanceMonth > b.AttendanceMonth
        OR (
          a.AttendanceMonth = b.AttendanceMonth
          AND a.AttendanceID < b.AttendanceID
        )
      )
  `);

  const [[after]] = await connection.query(`
    SELECT
      COUNT(*) AS totalRows,
      COUNT(DISTINCT AttendanceID) AS distinctAttendanceIds,
      COUNT(DISTINCT CONCAT(EmployeeID, '|', YEAR(AttendanceMonth), '|', MONTH(AttendanceMonth))) AS distinctEmployeeMonths
    FROM attendance
  `);

  console.log('Deleted rows:', result.affectedRows ?? 0);
  console.log('After cleanup:', after);

  await connection.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
