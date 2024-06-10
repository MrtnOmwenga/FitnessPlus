import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerService } from './mailer.service';
import * as nodemailer from 'nodemailer';
import config from '../config/configuration';

describe('MailerService (Integration)', () => {
  let service: MailerService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true, load: [config] })],
      providers: [MailerService, ConfigService],
    }).compile();

    service = module.get<MailerService>(MailerService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should send an actual email', async () => {
    const emailUser = configService.get<string>('email.user');
    const emailPass = configService.get<string>('email.pass');

    expect(emailUser).toBeDefined();
    expect(emailPass).toBeDefined();

    const result = await service.sendMail('martin36449@gmail.com', 'Test Subject', 'Test Body');

    expect(result).toBeDefined();
    expect(result.accepted).toContain('martin36449@gmail.com');
  });
});
