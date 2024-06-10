import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment';

@Injectable()
export class MailerService {
  private transporter;
  private readonly logger = new Logger(MailerService.name);

  constructor(private configService: ConfigService) {
    const emailUser = this.configService.get<string>('email.user');
    const emailPass = this.configService.get<string>('email.pass');
    const smtpHost = this.configService.get<string>('email.smtpHost');
    const smtpPort = this.configService.get<number>('email.smtpPort');

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: true,
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
  
    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent to ${to}: ${info.messageId}`);
      return info;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to send email. Please try again later.');
    }
  }

  generateEmailContent(user: any, combinedFee: number) {
    const dueDateFormatted = moment(user.dueDate).format('MMMM Do YYYY');
    return `
      <h1>Subscription Reminder</h1>
      <p>Dear ${user.firstName} ${user.lastName},</p>
      <p>We would like to remind you about your subscription.</p>
      <p><strong>Subscription Type:</strong> ${user.membershipType}</p>
      <p><strong>Due Date:</strong> ${dueDateFormatted}</p>
      <p><strong>Amount Due:</strong> ${combinedFee}</p>
      <p>Thank you for being with us!</p>
    `;
  }
}
