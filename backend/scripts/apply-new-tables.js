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

async function main() {
  const env = loadEnv();
  const sqlPath = path.join(__dirname, '..', 'sql', 'new-tables.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  const connection = await mysql.createConnection({
    host: env.PAYROLL_DB_HOST || 'localhost',
    port: Number(env.PAYROLL_DB_PORT || 3306),
    user: env.PAYROLL_DB_USER || 'root',
    password: env.PAYROLL_DB_PASS || '',
    database: env.PAYROLL_DB_NAME || 'payroll_2026',
    multipleStatements: true,
  });

  try {
    await connection.query(sql);
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME
      FROM information_schema.columns
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'attendance'
        AND COLUMN_NAME = 'OvertimeHours'
    `);
    if (columns.length === 0) {
      await connection.query(`
        ALTER TABLE attendance
        ADD COLUMN OvertimeHours DECIMAL(6,2) NOT NULL DEFAULT 0
      `);
    }
    console.log('Applied backend/sql/new-tables.sql successfully.');
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
