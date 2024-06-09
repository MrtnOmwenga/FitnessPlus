import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailerService {
  private transporter;

  constructor(private configService: ConfigService) {
    const emailUser = this.configService.get<string>('email.user');
    const emailPass = this.configService.get<string>('email.pass');

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
  }

  async sendMail(to: string, subject: string, html: string) {
    const mailOptions = {
      from: this.configService.get<string>('email.user'),
      to,
      subject,
      html,
    };

    return this.transporter.sendMail(mailOptions);
  }
}
