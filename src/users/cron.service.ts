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

    users.forEach(async (user) => {
      if (user.isFirstMonth) {
        const combinedFee = user.totalAmount + (user.monthlyAmount || 0);
        await this.mailerService.sendMail(user.email, 'Combined fee for the first month', `Your combined fee for the first month is ${combinedFee}`);
      } else {
        await this.mailerService.sendMail(user.email, 'Monthly add-on service reminder', `Your monthly add-on service fee is ${user.monthlyAmount}`);
      }
    });
  }
}
