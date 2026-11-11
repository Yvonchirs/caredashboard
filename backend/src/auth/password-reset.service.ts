import { createHash, randomBytes } from 'node:crypto';
import { EntityManager } from '@mikro-orm/sqlite';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { hashPassword } from '../common/password.util.js';
import { User } from '../entities/index.js';
import { resetEmail, welcomeEmail } from '../mail/mail-templates.js';
import { MailService } from '../mail/mail.service.js';

const HOUR_MS = 3_600_000;
const RESET_HOURS = 2;
const WELCOME_HOURS = 72;
/** A forgot-password request is ignored if the previous link was issued less than this long ago. */
const RESEND_AFTER_MS = 60_000;

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

@Injectable()
export class PasswordResetService {
  constructor(
    private readonly em: EntityManager,
    private readonly mail: MailService,
    private readonly config: ConfigService,
  ) {}

  /** Emails a new user a link to choose their password; returns whether the email was sent. */
  async sendWelcome(user: User): Promise<boolean> {
    const token = await this.issueToken(user, WELCOME_HOURS);
    return this.mail.send(welcomeEmail(user.name, user.email, this.link(token), WELCOME_HOURS));
  }

  /** Emails a reset link after an admin resets a password; returns whether the email was sent. */
  async sendAdminReset(user: User): Promise<boolean> {
    const token = await this.issueToken(user, RESET_HOURS);
    return this.mail.send(resetEmail(user.name, user.email, this.link(token), RESET_HOURS));
  }

  /** Public "forgot password": always silent about whether the account exists. */
  async forgot(email: string): Promise<void> {
    const user = await this.em.findOne(User, { email: email.toLowerCase().trim(), isActive: true });
    if (!user) return;
    const issuedAt = user.resetTokenExpiresAt ? user.resetTokenExpiresAt.getTime() - this.lifetime(user) : 0;
    if (Date.now() - issuedAt < RESEND_AFTER_MS) return;
    await this.sendAdminReset(user);
  }

  async reset(token: string, newPassword: string): Promise<void> {
    const user = await this.em.findOne(User, { resetTokenHash: hashToken(token), isActive: true });
    if (!user?.resetTokenExpiresAt || user.resetTokenExpiresAt.getTime() < Date.now()) {
      throw new BadRequestException('This link is invalid or has expired. Request a new one.');
    }
    user.passwordHash = await hashPassword(newPassword);
    user.mustChangePassword = false;
    user.resetTokenHash = null;
    user.resetTokenExpiresAt = null;
    await this.em.flush();
  }

  private async issueToken(user: User, hours: number): Promise<string> {
    const token = randomBytes(32).toString('base64url');
    user.resetTokenHash = hashToken(token);
    user.resetTokenExpiresAt = new Date(Date.now() + hours * HOUR_MS);
    user.resetTokenHours = hours;
    await this.em.flush();
    return token;
  }

  private lifetime(user: User) {
    return (user.resetTokenHours ?? RESET_HOURS) * HOUR_MS;
  }

  private link(token: string) {
    const base = (this.config.get<string>('APP_URL') ?? 'http://localhost:3000').replace(/\/$/, '');
    return `${base}/reset-password?token=${token}`;
  }
}
