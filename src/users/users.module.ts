import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersCronService } from './cron.service';
import { MailerService } from './mailer.service';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService, UsersCronService, MailerService],
  exports: [UsersService, UsersCronService],
})
export class UsersModule {}
