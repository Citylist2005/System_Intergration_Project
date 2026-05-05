import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  DEFAULT_PERMISSIONS,
  DEFAULT_ROLES,
  ROLE_PERMISSION_MAP,
  normalizeRoleName,
} from '../modules/auth/rbac-defaults';

interface ConnectionStatus {
  connected: boolean;
  lastCheckedAt: string | null;
  error: string | null;
}

@Injectable()
export class DatabaseConnectionsService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DatabaseConnectionsService.name);
  private payrollSchemaEnsured = false;
  private readonly statuses: Record<string, ConnectionStatus> = {
    humanConnection: {
      connected: false,
      lastCheckedAt: null,
      error: null,
    },
    payrollConnection: {
      connected: false,
      lastCheckedAt: null,
      error: null,
    },
  };

  constructor(
    @InjectDataSource('humanConnection')
    private readonly humanDataSource: DataSource,

    @InjectDataSource('payrollConnection')
    private readonly payrollDataSource: DataSource,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    if (process.env.NODE_ENV === 'test') {
      this.logger.log('Skipping database background startup in test mode');
      return;
    }

    void this.initializeDataSource(
      this.payrollDataSource,
      'payrollConnection',
    ).catch((error: unknown) => {
      const message =
        error instanceof Error ? error.message : 'Unknown database error';
      this.logger.error(`payrollConnection background startup failed: ${message}`);
    });

    void this.initializeDataSource(
      this.humanDataSource,
      'humanConnection',
    ).catch((error: unknown) => {
      const message =
        error instanceof Error ? error.message : 'Unknown database error';
      this.logger.error(`humanConnection background startup failed: ${message}`);
    });
  }

  private async initializeDataSource(
    dataSource: DataSource,
    connectionName: string,
  ): Promise<void> {
    if (dataSource.isInitialized) {
      if (connectionName === 'payrollConnection') {
        await this.ensurePayrollRuntimeSchema(dataSource);
      }

      this.statuses[connectionName] = {
        connected: true,
        lastCheckedAt: new Date().toISOString(),
        error: null,
      };
      this.logger.log(`${connectionName} is already initialized`);
      return;
    }

    try {
      await dataSource.initialize();
      if (connectionName === 'payrollConnection') {
        await this.ensurePayrollRuntimeSchema(dataSource);
      }

      this.statuses[connectionName] = {
        connected: true,
        lastCheckedAt: new Date().toISOString(),
        error: null,
      };
      this.logger.log(`${connectionName} connected successfully`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown database error';

      this.statuses[connectionName] = {
        connected: false,
        lastCheckedAt: new Date().toISOString(),
        error: message,
      };

      this.logger.error(
        `${connectionName} failed to connect during startup: ${message}`,
      );
    }
  }

  async ensureHumanConnection(): Promise<void> {
    await this.initializeDataSource(this.humanDataSource, 'humanConnection');
  }

  async testHumanConnection(): Promise<unknown[]> {
    await this.ensureHumanConnection();

    if (!this.humanDataSource.isInitialized) {
      const error =
        this.statuses.humanConnection.error ??
        'humanConnection is not connected to SQL Server';

      throw new Error(error);
    }

    return this.humanDataSource.query(
      'SELECT TOP 5 * FROM HUMAN_2025.dbo.Departments',
    );
  }

  getConnectionStatuses() {
    return {
      humanConnection: {
        ...this.statuses.humanConnection,
      },
      payrollConnection: {
        ...this.statuses.payrollConnection,
      },
    };
  }

  private async ensurePayrollRuntimeSchema(dataSource: DataSource): Promise<void> {
    if (this.payrollSchemaEnsured) {
      return;
    }

    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS sync_status (
        StatusID INT AUTO_INCREMENT PRIMARY KEY,
        SyncType VARCHAR(30) NOT NULL,
        Status VARCHAR(20) NOT NULL,
        StartedAt DATETIME NULL,
        CompletedAt DATETIME NULL,
        Details JSON NULL,
        CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS system_backups (
        BackupID INT AUTO_INCREMENT PRIMARY KEY,
        BackupType VARCHAR(30) DEFAULT 'Manual',
        BackupName VARCHAR(255) NULL,
        FilePath VARCHAR(500) NULL,
        FileSize BIGINT NULL,
        Status VARCHAR(20) DEFAULT 'Running',
        StartedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        CompletedAt DATETIME NULL,
        Duration INT NULL,
        CreatedBy INT NULL,
        Notes TEXT NULL
      )
    `);

    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS pit_tax_brackets (
        BracketID INT AUTO_INCREMENT PRIMARY KEY,
        EffectiveDate DATE NOT NULL,
        MinIncome DECIMAL(15,2) NOT NULL DEFAULT 0,
        MaxIncome DECIMAL(15,2) NULL,
        Rate DECIMAL(5,2) NOT NULL,
        Deduction DECIMAL(15,2) NOT NULL DEFAULT 0,
        IsActive TINYINT(1) DEFAULT 1,
        CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS kpi_okr (
        KpiID INT AUTO_INCREMENT PRIMARY KEY,
        EmployeeID INT NOT NULL,
        Period VARCHAR(20) NOT NULL,
        PeriodType VARCHAR(10) DEFAULT 'Quarterly',
        Title VARCHAR(255) NOT NULL,
        Description TEXT NULL,
        TargetValue DECIMAL(10,2) NULL,
        ActualValue DECIMAL(10,2) NULL,
        Weight DECIMAL(5,2) DEFAULT 100,
        Score DECIMAL(5,2) NULL,
        BonusAmount DECIMAL(15,2) DEFAULT 0,
        Status VARCHAR(20) DEFAULT 'Active',
        CreatedBy INT NULL,
        CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_kpi_employee (EmployeeID),
        INDEX idx_kpi_period (Period)
      )
    `);

    await this.addColumnIfTableExists(
      dataSource,
      'system_backups',
      'RestoredAt',
      'DATETIME NULL',
    );
    await this.addColumnIfTableExists(
      dataSource,
      'system_backups',
      'RestoredBy',
      'INT NULL',
    );
    await this.addColumnIfTableExists(
      dataSource,
      'kpi_okr',
      'BonusAmount',
      'DECIMAL(15,2) DEFAULT 0',
    );
    await this.addColumnIfTableExists(
      dataSource,
      'attendance',
      'OvertimeHours',
      'DECIMAL(6,2) DEFAULT 0',
    );
    await this.addColumnIfTableExists(
      dataSource,
      'users',
      'ResetPasswordToken',
      'VARCHAR(100) NULL',
    );
    await this.addColumnIfTableExists(
      dataSource,
      'users',
      'ResetPasswordExpiry',
      'DATETIME NULL',
    );

    await this.ensureRbacSchema(dataSource);
    await this.seedDefaultPitBrackets(dataSource);
    await this.seedDefaultRbac(dataSource);
    this.payrollSchemaEnsured = true;
    this.logger.log('payrollConnection runtime schema is ready');
  }

  private async addColumnIfTableExists(
    dataSource: DataSource,
    tableName: string,
    columnName: string,
    definition: string,
  ): Promise<void> {
    const tables: Array<{ total: string | number }> = await dataSource.query(
      `
        SELECT COUNT(*) AS total
        FROM information_schema.tables
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = ?
      `,
      [tableName],
    );

    if (Number(tables[0]?.total ?? 0) === 0) {
      return;
    }

    const columns: Array<{ total: string | number }> = await dataSource.query(
      `
        SELECT COUNT(*) AS total
        FROM information_schema.columns
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = ?
          AND COLUMN_NAME = ?
      `,
      [tableName, columnName],
    );

    if (Number(columns[0]?.total ?? 0) > 0) {
      return;
    }

    await dataSource.query(
      `ALTER TABLE \`${tableName}\` ADD COLUMN \`${columnName}\` ${definition}`,
    );
  }

  private async seedDefaultPitBrackets(dataSource: DataSource): Promise<void> {
    const rows: Array<{ total: string | number }> = await dataSource.query(`
      SELECT COUNT(*) AS total
      FROM pit_tax_brackets
      WHERE EffectiveDate = '2024-01-01'
        AND IsActive = 1
    `);

    if (Number(rows[0]?.total ?? 0) > 0) {
      return;
    }

    await dataSource.query(`
      INSERT INTO pit_tax_brackets
        (EffectiveDate, MinIncome, MaxIncome, Rate, Deduction)
      VALUES
        ('2024-01-01', 0,        5000000,  5, 0),
        ('2024-01-01', 5000000,  10000000, 10, 250000),
        ('2024-01-01', 10000000, 18000000, 15, 750000),
        ('2024-01-01', 18000000, 32000000, 20, 1650000),
        ('2024-01-01', 32000000, 52000000, 25, 3250000),
        ('2024-01-01', 52000000, 80000000, 30, 5850000),
        ('2024-01-01', 80000000, NULL,     35, 9850000)
    `);
  }

  private async ensureRbacSchema(dataSource: DataSource): Promise<void> {
    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id INT NOT NULL AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        description VARCHAR(255) NULL,
        createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        UNIQUE KEY UQ_roles_name (name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS permissions (
        id INT NOT NULL AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        description VARCHAR(255) NULL,
        createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        UNIQUE KEY UQ_permissions_name (name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS user_roles (
        userId INT NOT NULL,
        roleId INT NOT NULL,
        PRIMARY KEY (userId, roleId),
        INDEX idx_user_roles_role (roleId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        roleId INT NOT NULL,
        permissionId INT NOT NULL,
        PRIMARY KEY (roleId, permissionId),
        INDEX idx_role_permissions_permission (permissionId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  }

  private async seedDefaultRbac(dataSource: DataSource): Promise<void> {
    for (const role of DEFAULT_ROLES) {
      await dataSource.query(
        `
          INSERT INTO roles (name, description)
          VALUES (?, ?)
          ON DUPLICATE KEY UPDATE description = VALUES(description)
        `,
        [role.name, role.description],
      );
    }

    for (const permission of DEFAULT_PERMISSIONS) {
      await dataSource.query(
        `
          INSERT INTO permissions (name, description)
          VALUES (?, ?)
          ON DUPLICATE KEY UPDATE description = VALUES(description)
        `,
        [permission, permission],
      );
    }

    for (const [roleName, permissionNames] of Object.entries(ROLE_PERMISSION_MAP)) {
      const roleRows: Array<{ id: number }> = await dataSource.query(
        'SELECT id FROM roles WHERE name = ? LIMIT 1',
        [roleName],
      );
      const roleId = roleRows[0]?.id;
      if (!roleId) continue;

      for (const permissionName of permissionNames) {
        const permissionRows: Array<{ id: number }> = await dataSource.query(
          'SELECT id FROM permissions WHERE name = ? LIMIT 1',
          [permissionName],
        );
        const permissionId = permissionRows[0]?.id;
        if (!permissionId) continue;

        await dataSource.query(
          `
            INSERT IGNORE INTO role_permissions (roleId, permissionId)
            VALUES (?, ?)
          `,
          [roleId, permissionId],
        );
      }
    }

    const legacyUsers: Array<{ UserID: number; Role: string | null }> =
      await dataSource.query('SELECT UserID, Role FROM users WHERE IsActive = 1');

    for (const user of legacyUsers) {
      const roleName = normalizeRoleName(user.Role);
      if (!roleName) continue;

      const roleRows: Array<{ id: number }> = await dataSource.query(
        'SELECT id FROM roles WHERE name = ? LIMIT 1',
        [roleName],
      );
      const roleId = roleRows[0]?.id;
      if (!roleId) continue;

      await dataSource.query(
        `
          DELETE ur
          FROM user_roles ur
          INNER JOIN roles r ON r.id = ur.roleId
          WHERE ur.userId = ?
            AND r.name IN ('ADMIN', 'HR_MANAGER', 'PAYROLL_MANAGER', 'EMPLOYEE')
            AND r.name <> ?
        `,
        [user.UserID, roleName],
      );

      await dataSource.query(
        `
          INSERT IGNORE INTO user_roles (userId, roleId)
          VALUES (?, ?)
        `,
        [user.UserID, roleId],
      );
    }
  }
}
