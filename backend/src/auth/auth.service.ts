import { EntityManager } from '@mikro-orm/sql';
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hashPassword, verifyPassword } from '../common/password.util.js';
import { serializeUser } from '../common/serializers.js';
import { User } from '../entities/index.js';
import type { JwtPayload } from './auth.guard.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly em: EntityManager,
    private readonly jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.em.findOne(User, { email: email.toLowerCase() }, { populate: ['projects'] });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    if (!user.isActive) throw new UnauthorizedException('Your account has been deactivated');

    const payload: JwtPayload = { sub: user.id };
    return { accessToken: await this.jwt.signAsync(payload), user: serializeUser(user) };
  }

  async changePassword(user: User, currentPassword: string, newPassword: string) {
    if (!(await verifyPassword(currentPassword, user.passwordHash))) {
      throw new BadRequestException('Current password is incorrect');
    }
    user.passwordHash = await hashPassword(newPassword);
    user.mustChangePassword = false;
    await this.em.flush();
    return serializeUser(user);
  }
}
