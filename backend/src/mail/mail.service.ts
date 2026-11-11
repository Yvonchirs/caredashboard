import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, type Transporter } from 'nodemailer';

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
  html: string;
}

/** Sends mail over SMTP (SMTP_* env). Without SMTP_HOST, messages are only logged, which is handy in development. */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transport: Transporter | null;
  private readonly from: string;

  constructor(config: ConfigService) {
    const host = config.get<string>('SMTP_HOST');
    this.from = config.get<string>('MAIL_FROM') ?? 'CARE Rwanda Activity Board <no-reply@care.org.rw>';
    const user = config.get<string>('SMTP_USER');
    const port = Number(config.get('SMTP_PORT') ?? 587);
    this.transport = host
      ? createTransport({
          host,
          port,
          secure: config.get('SMTP_SECURE') === 'true' || port === 465,
          auth: user ? { user, pass: config.get<string>('SMTP_PASS') } : undefined,
        })
      : null;
  }

  /** Returns whether the message was handed to the mail server; never throws. */
  async send(message: MailMessage): Promise<boolean> {
    if (!this.transport) {
      this.logger.warn(`SMTP_HOST is not set, so this email was not sent.\nTo: ${message.to}\nSubject: ${message.subject}\n${message.text}`);
      return false;
    }
    try {
      await this.transport.sendMail({ from: this.from, ...message });
      return true;
    } catch (error) {
      this.logger.error(`Could not send "${message.subject}" to ${message.to}: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }
}
