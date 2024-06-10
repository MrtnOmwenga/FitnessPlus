import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UsersService } from './users.service';
import { MailerService } from './mailer.service';

@Injectable()
export class UsersCronService {
  constructor(
    private readonly usersService: UsersService,
    private readonly mailerService: MailerService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    const users = await this.usersService.findDueUsers();

    for (const user of users) {
      let subject: string;
      let html: string;

      if (user.isFirstMonth) {
        const combinedFee = +user.totalAmount + (+user.monthlyAmount || 0);
        subject = 'Combined fee for the first month';
        html = this.mailerService.generateEmailContent(user, combinedFee);
      } else {
        subject = 'Monthly add-on service reminder';
        html = this.mailerService.generateEmailContent(user, user.monthlyAmount);
      }

      try {
        await this.mailerService.sendMail(user.email, subject, html);
      } catch (error) {
        console.error('Error occurred while sending email:', error);
      }
    }
  }
}
