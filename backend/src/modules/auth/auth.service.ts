import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthTokenService } from './auth-token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly authTokenService: AuthTokenService,
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

    if (username !== adminUsername || password !== adminPassword) {
      throw new UnauthorizedException('Sai tên đăng nhập hoặc mật khẩu');
    }

    const expiresIn = 3600;
    const accessToken = this.authTokenService.sign(
      {
        sub: 1,
        username,
        role: 'ADMIN',
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
          id: 1,
          username,
          fullName: 'Quản trị viên',
          role: 'ADMIN',
        },
      },
    };
  }

  async getProfile() {
    return {
      status: 'success',
      data: {
        id: 1,
        username:
          this.configService.get<string>('ADMIN_EMAIL') ??
          this.configService.get<string>('AUTH_USERNAME') ??
          'admin@docusync.local',
        fullName: 'Quản trị viên',
        role: 'ADMIN',
      },
    };
  }
}
