import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';

interface TokenPayload {
  sub: number;
  username: string;
  role: string;
  exp: number;
}

function base64UrlEncode(value: string) {
  return Buffer.from(value)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(value: string) {
  const padded = value + '='.repeat((4 - (value.length % 4)) % 4);
  return Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
}

@Injectable()
export class AuthTokenService {
  constructor(private readonly configService: ConfigService) {}

  private get secret() {
    return this.configService.get<string>('AUTH_TOKEN_SECRET', 'dev-only-auth-secret');
  }

  sign(payload: Omit<TokenPayload, 'exp'>, expiresInSeconds = 3600) {
    const body: TokenPayload = {
      ...payload,
      exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
    };
    const encodedPayload = base64UrlEncode(JSON.stringify(body));
    const signature = this.createSignature(encodedPayload);

    return `${encodedPayload}.${signature}`;
  }

  verify(token: string): TokenPayload {
    const [encodedPayload, signature] = token.split('.');

    if (!encodedPayload || !signature) {
      throw new UnauthorizedException('Token không hợp lệ');
    }

    const expectedSignature = this.createSignature(encodedPayload);
    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      throw new UnauthorizedException('Token không hợp lệ');
    }

    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as TokenPayload;

    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      throw new UnauthorizedException('Phiên đăng nhập đã hết hạn');
    }

    return payload;
  }

  private createSignature(encodedPayload: string) {
    return createHmac('sha256', this.secret)
      .update(encodedPayload)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }
}
