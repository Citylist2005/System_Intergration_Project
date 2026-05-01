import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/payroll/entities/user.entity';
import { AuthTokenService } from './auth-token.service';
import { hashPassword, verifyPassword } from './password.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly authTokenService: AuthTokenService,
    @InjectRepository(User, 'payrollConnection')
    private readonly userRepo: Repository<User>,
  ) {}

  async login(username: string, password: string) {
    const adminUsername =
      this.configService.get<string>('ADMIN_EMAIL') ??
      this.configService.get<string>('AUTH_USERNAME') ??
      'admin@docusync.local';
    const adminPassword =
      this.configService.get<string>('ADMIN_PASSWORD') ??
      this.configService.get<string>('AUTH_PASSWORD') ??
      'change-me';

    let user = await this.userRepo.findOne({
      where: [{ Username: username }, { Email: username }],
    });

    const envAdminLogin = username === adminUsername && password === adminPassword;
    const dbLogin = Boolean(user?.IsActive && verifyPassword(password, user.PasswordHash));

    if (!dbLogin && !envAdminLogin) {
      throw new UnauthorizedException('Sai tên đăng nhập hoặc mật khẩu');
    }

    if (!user && envAdminLogin) {
      user = await this.userRepo.save(
        this.userRepo.create({
          Username: adminUsername,
          Email: adminUsername,
          PasswordHash: hashPassword(adminPassword),
          FullName: 'Quản trị viên',
          Role: 'Admin',
          IsActive: true,
        }),
      );
    } else if (user && envAdminLogin && !verifyPassword(password, user.PasswordHash)) {
      user.PasswordHash = hashPassword(password);
      user.IsActive = true;
    }

    if (!user) {
      throw new UnauthorizedException('Sai tên đăng nhập hoặc mật khẩu');
    }

    user.LastLoginAt = new Date();
    await this.userRepo.save(user);

    const expiresIn = 3600;
    const accessToken = this.authTokenService.sign(
      {
        sub: user.UserID,
        username: user.Username,
        role: user.Role,
        employeeId: user.EmployeeID,
      },
      expiresIn,
    );

    return {
      status: 'success',
      message: 'Đăng nhập thành công',
      data: {
        accessToken,
        expiresIn,
        user: {
          id: user.UserID,
          username: user.Username,
          fullName: user.FullName,
          role: user.Role,
          employeeId: user.EmployeeID,
        },
      },
    };
  }

  async getProfile() {
    return {
      status: 'success',
      data: {
        username:
          this.configService.get<string>('ADMIN_EMAIL') ??
          this.configService.get<string>('AUTH_USERNAME') ??
          'admin@docusync.local',
        fullName: 'Quản trị viên',
        role: 'Admin',
      },
    };
  }
}
