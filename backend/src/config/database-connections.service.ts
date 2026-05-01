import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

interface ConnectionStatus {
  connected: boolean;
  lastCheckedAt: string | null;
  error: string | null;
}

@Injectable()
export class DatabaseConnectionsService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DatabaseConnectionsService.name);
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
    await this.initializeDataSource(this.humanDataSource, 'humanConnection');
    await this.initializeDataSource(
      this.payrollDataSource,
      'payrollConnection',
    );
  }

  private async initializeDataSource(
    dataSource: DataSource,
    connectionName: string,
  ): Promise<void> {
    if (dataSource.isInitialized) {
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
}
