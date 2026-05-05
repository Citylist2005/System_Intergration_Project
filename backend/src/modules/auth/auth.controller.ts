import { Controller, Post, Body, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';
import { TokenPayload } from './auth-token.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  async login(@Body() body: { username?: string; email?: string; password: string }) {
    return this.authService.login(body.username ?? body.email ?? '', body.password);
  }

  @Post('forgot-password')
  @Public()
  async forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('reset-password')
  @Public()
  async resetPassword(@Body() body: { token: string; newPassword: string }) {
    return this.authService.resetPassword(body.token, body.newPassword);
  }

  @Get('profile')
  async getProfile(@Req() req: Request & { user?: TokenPayload }) {
    return this.authService.getProfile(req.user!.sub);
  }
}
