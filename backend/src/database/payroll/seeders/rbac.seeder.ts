/**
 * RBAC Seeder — creates tables, seeds default roles/permissions, and demo users
 * Run with: npm run seed:rbac
 */
import { DataSource } from 'typeorm';
import { randomBytes, scryptSync } from 'crypto';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../../../../.env') });

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Same algorithm as backend/src/modules/auth/password.service.ts */
function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

// ─── Seed data ───────────────────────────────────────────────────────────────

const ROLES = [
  { name: 'ADMIN',           description: 'Quản trị viên hệ thống — toàn quyền' },
  { name: 'HR_MANAGER',      description: 'Quản lý nhân sự — quản lý nhân viên, chấm công, KPI' },
  { name: 'PAYROLL_MANAGER', description: 'Quản lý lương — tính lương, chính sách, phúc lợi' },
  { name: 'EMPLOYEE',        description: 'Nhân viên — xem thông tin cá nhân và lương của mình' },
];

const PERMISSIONS = [
  { name: 'employee.read',      description: 'Xem danh sách và chi tiết nhân viên' },
  { name: 'employee.create',    description: 'Thêm nhân viên mới' },
  { name: 'employee.update',    description: 'Cập nhật thông tin nhân viên' },
  { name: 'employee.delete',    description: 'Xoá / vô hiệu hoá nhân viên' },
  { name: 'attendance.read',    description: 'Xem dữ liệu chấm công' },
  { name: 'attendance.create',  description: 'Tạo bản ghi chấm công' },
  { name: 'attendance.update',  description: 'Cập nhật bản ghi chấm công' },
  { name: 'payroll.read',       description: 'Xem bảng lương' },
  { name: 'payroll.calculate',  description: 'Tính lương tháng' },
  { name: 'payroll.update',     description: 'Cập nhật / điều chỉnh lương' },
  { name: 'reports.read',       description: 'Xem báo cáo tổng hợp' },
  { name: 'dashboard.read',     description: 'Xem bảng điều khiển' },
  { name: 'user.manage',        description: 'Quản lý tài khoản người dùng' },
  { name: 'role.manage',        description: 'Phân quyền vai trò' },
  { name: 'audit.read',         description: 'Xem nhật ký hệ thống' },
  { name: 'system.manage',      description: 'Quản trị hệ thống (sao lưu, đồng bộ...)' },
];

/** Permissions assigned per role */
const ROLE_PERMISSIONS: Record<string, string[]> = {
  ADMIN: PERMISSIONS.map((p) => p.name), // all

  HR_MANAGER: [
    'employee.read', 'employee.create', 'employee.update', 'employee.delete',
    'attendance.read', 'attendance.create', 'attendance.update',
    'reports.read', 'dashboard.read',
  ],

  PAYROLL_MANAGER: [
    'employee.read',
    'payroll.read', 'payroll.calculate', 'payroll.update',
    'reports.read', 'dashboard.read',
  ],

  EMPLOYEE: [
    'employee.read',    // own profile (service-level filter)
    'attendance.read',  // own records
    'payroll.read',     // own payroll summary
    'dashboard.read',
  ],
};

/** Demo users seeded for RBAC testing */
const DEMO_USERS = [
  {
    username:  'admin@docusync.local',
    email:     'admin@docusync.local',
    password:  'change-me',
    fullName:  'Quản trị viên',
    role:      'Admin',        // legacy column
    roleName:  'ADMIN',
  },
  {
    username:  'hr@company.local',
    email:     'hr@company.local',
    password:  'change-me',
    fullName:  'Quản lý nhân sự',
    role:      'HR_Manager',
    roleName:  'HR_MANAGER',
  },
  {
    username:  'payroll@company.local',
    email:     'payroll@company.local',
    password:  'change-me',
    fullName:  'Quản lý lương',
    role:      'Payroll_Manager',
    roleName:  'PAYROLL_MANAGER',
  },
  {
    username:  'employee@company.local',
    email:     'employee@company.local',
    password:  'change-me',
    fullName:  'Nhân viên Demo',
    role:      'Employee',
    roleName:  'EMPLOYEE',
  },
];

// ─── Main ────────────────────────────────────────────────────────────────────

async function seed() {
  const ds = new DataSource({
    type: 'mysql',
    host:     process.env.PAYROLL_DB_HOST || 'localhost',
    port:     Number(process.env.PAYROLL_DB_PORT) || 3306,
    username: process.env.PAYROLL_DB_USER || 'root',
    password: process.env.PAYROLL_DB_PASS || '',
    database: process.env.PAYROLL_DB_NAME || 'payroll_2026',
  });

  await ds.initialize();
  const qr = ds.createQueryRunner();
  await qr.connect();

  try {
    // ── Create tables ────────────────────────────────────────────────────────
    console.log('🔧  Creating RBAC tables if not exist...');

    await qr.query(`
      CREATE TABLE IF NOT EXISTS \`roles\` (
        \`id\`          INT NOT NULL AUTO_INCREMENT,
        \`name\`        VARCHAR(100) NOT NULL,
        \`description\` VARCHAR(255) NULL,
        \`createdAt\`   DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\`   DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_roles_name\` (\`name\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await qr.query(`
      CREATE TABLE IF NOT EXISTS \`permissions\` (
        \`id\`          INT NOT NULL AUTO_INCREMENT,
        \`name\`        VARCHAR(100) NOT NULL,
        \`description\` VARCHAR(255) NULL,
        \`createdAt\`   DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\`   DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_permissions_name\` (\`name\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await qr.query(`
      CREATE TABLE IF NOT EXISTS \`user_roles\` (
        \`userId\` INT NOT NULL,
        \`roleId\` INT NOT NULL,
        PRIMARY KEY (\`userId\`, \`roleId\`),
        CONSTRAINT \`FK_user_roles_user\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`UserID\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_user_roles_role\` FOREIGN KEY (\`roleId\`) REFERENCES \`roles\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await qr.query(`
      CREATE TABLE IF NOT EXISTS \`role_permissions\` (
        \`roleId\`       INT NOT NULL,
        \`permissionId\` INT NOT NULL,
        PRIMARY KEY (\`roleId\`, \`permissionId\`),
        CONSTRAINT \`FK_role_permissions_role\`       FOREIGN KEY (\`roleId\`)       REFERENCES \`roles\`(\`id\`)       ON DELETE CASCADE,
        CONSTRAINT \`FK_role_permissions_permission\` FOREIGN KEY (\`permissionId\`) REFERENCES \`permissions\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log('✅  Tables ready.');

    // ── Upsert roles ─────────────────────────────────────────────────────────
    console.log('🌱  Seeding roles...');
    for (const role of ROLES) {
      await qr.query(
        `INSERT INTO \`roles\` (\`name\`, \`description\`) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE \`description\` = VALUES(\`description\`)`,
        [role.name, role.description],
      );
    }

    // ── Upsert permissions ────────────────────────────────────────────────────
    console.log('🌱  Seeding permissions...');
    for (const perm of PERMISSIONS) {
      await qr.query(
        `INSERT INTO \`permissions\` (\`name\`, \`description\`) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE \`description\` = VALUES(\`description\`)`,
        [perm.name, perm.description],
      );
    }

    // ── Assign role_permissions ───────────────────────────────────────────────
    console.log('🌱  Assigning permissions to roles...');
    for (const [roleName, permNames] of Object.entries(ROLE_PERMISSIONS)) {
      const [roleRow] = await qr.query(`SELECT id FROM \`roles\` WHERE name = ?`, [roleName]) as any[];
      if (!roleRow) { console.warn(`  ⚠️  Role not found: ${roleName}`); continue; }

      for (const permName of permNames) {
        const [permRow] = await qr.query(`SELECT id FROM \`permissions\` WHERE name = ?`, [permName]) as any[];
        if (!permRow) { console.warn(`  ⚠️  Permission not found: ${permName}`); continue; }

        await qr.query(
          `INSERT IGNORE INTO \`role_permissions\` (\`roleId\`, \`permissionId\`) VALUES (?, ?)`,
          [roleRow.id, permRow.id],
        );
      }
    }

    // ── Seed demo users ───────────────────────────────────────────────────────
    console.log('\n👤  Seeding demo users...');

    const seededAccounts: Array<{ email: string; password: string; role: string; action: string }> = [];

    for (const demo of DEMO_USERS) {
      // Check if user already exists (by email)
      const [existing] = await qr.query(
        `SELECT \`UserID\` FROM \`users\` WHERE \`Email\` = ? OR \`Username\` = ? LIMIT 1`,
        [demo.email, demo.username],
      ) as any[];

      let userId: number;

      if (existing) {
        userId = existing.UserID;
        seededAccounts.push({ email: demo.email, password: demo.password, role: demo.roleName, action: 'skipped (already exists)' });
      } else {
        const passwordHash = hashPassword(demo.password);
        const result = await qr.query(
          `INSERT INTO \`users\` (\`Username\`, \`Email\`, \`PasswordHash\`, \`FullName\`, \`Role\`, \`IsActive\`)
           VALUES (?, ?, ?, ?, ?, 1)`,
          [demo.username, demo.email, passwordHash, demo.fullName, demo.role],
        ) as any;
        userId = result.insertId;
        seededAccounts.push({ email: demo.email, password: demo.password, role: demo.roleName, action: 'created' });
      }

      // Assign RBAC role (skip if already assigned)
      const [roleRow] = await qr.query(
        `SELECT id FROM \`roles\` WHERE name = ?`, [demo.roleName],
      ) as any[];

      if (roleRow) {
        await qr.query(
          `INSERT IGNORE INTO \`user_roles\` (\`userId\`, \`roleId\`) VALUES (?, ?)`,
          [userId, roleRow.id],
        );
      }
    }

    // ── Print summary ─────────────────────────────────────────────────────────
    console.log('\n🎉  RBAC seeding complete!\n');
    console.log('━'.repeat(72));
    console.log('  DEMO ACCOUNTS FOR RBAC TESTING');
    console.log('━'.repeat(72));
    console.log(
      '  Email'.padEnd(32) +
      'Password'.padEnd(14) +
      'Role'.padEnd(18) +
      'Status',
    );
    console.log('─'.repeat(72));
    for (const acct of seededAccounts) {
      console.log(
        `  ${acct.email}`.padEnd(32) +
        acct.password.padEnd(14) +
        acct.role.padEnd(18) +
        acct.action,
      );
    }
    console.log('━'.repeat(72));
    console.log('  Login at: http://127.0.0.1:5173');
    console.log('━'.repeat(72) + '\n');

  } catch (err) {
    console.error('❌  Seed failed:', err);
    process.exit(1);
  } finally {
    await qr.release();
    await ds.destroy();
  }
}

void seed();
