import { Test, TestingModule } from '@nestjs/testing';
import { UsersCronService } from './cron.service';
import { UsersService } from './users.service';
import { MailerService } from './mailer.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config from '../config/configuration';

describe('UsersCronService (Integration)', () => {
  let usersCronService: UsersCronService;
  let usersService: UsersService;
  let userRepository: Repository<User>;
  let mailerService: MailerService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [config],
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => ({
            type: 'postgres',
            host: configService.get<string>('database.host'),
            port: configService.get<number>('database.port'),
            username: configService.get<string>('database.username'),
            password: configService.get<string>('database.password'),
            database: configService.get<string>('database.database'),
            entities: [User],
            synchronize: true,
          }),
          inject: [ConfigService],
        }),
        TypeOrmModule.forFeature([User]),
      ],
      providers: [UsersCronService, UsersService, MailerService],
    }).compile();

    usersCronService = module.get<UsersCronService>(UsersCronService);
    usersService = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    mailerService = module.get<MailerService>(MailerService);
  });

  afterEach(async () => {
    await userRepository.clear(); // Clear the database after each test
  });

  it('should save users to the database and send emails', async () => {
    const user1: User = {
      id: 1,
      firstName: 'Martin',
      lastName: 'Omwenga',
      membershipType: 'Annual Basic',
      startDate: new Date(),
      dueDate: new Date(),
      monthlyDueDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
      totalAmount: 200,
      monthlyAmount: 50,
      email: 'martin36449@gmail.com',
      isFirstMonth: true,
      invoiceLink: 'https://example.com/invoice/1',
    };

    const user2: User = {
      id: 2,
      firstName: 'Omwenga',
      lastName: 'Martin',
      membershipType: 'Annual Basic',
      startDate: new Date(),
      dueDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
      monthlyDueDate: new Date(),
      totalAmount: 200,
      monthlyAmount: 50,
      email: 'mrtnomar15@gmail.com',
      isFirstMonth: false,
      invoiceLink: '',
    };

    await userRepository.save([user1, user2]);

    // Spy on the mailerService to count the number of emails sent
    const sendMailSpy = jest.spyOn(mailerService, 'sendMail');

    await usersCronService.handleCron();

    // Verify that the correct emails were sent
    expect(sendMailSpy).toHaveBeenCalledTimes(2);
    expect(sendMailSpy).toHaveBeenCalledWith(
      'martin36449@gmail.com',
      'Combined fee for the first month',
      expect.stringContaining('Subscription Reminder')
    );
    expect(sendMailSpy).toHaveBeenCalledWith(
      'mrtnomar15@gmail.com',
      'Monthly add-on service reminder',
      expect.stringContaining('Subscription Reminder')
    );
  });
});
