import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from '../config/configuration';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [configuration],
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
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(async () => {
    await repository.query('TRUNCATE TABLE members RESTART IDENTITY CASCADE');
  });

  afterAll(async () => {
    await repository.query('DROP TABLE members');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const user = repository.create({
        firstName: 'John',
        lastName: 'Doe',
        membershipType: 'Annual Basic',
        startDate: new Date(),
        totalAmount: 100,
        email: 'john@example.com',
      });
      await repository.save(user);

      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({ firstName: 'John', lastName: 'Doe' });
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      const user = repository.create({
        firstName: 'Jane',
        lastName: 'Doe',
        membershipType: 'Monthly Premium',
        startDate: new Date(),
        totalAmount: 100,
        email: 'jane@example.com',
      });
      await repository.save(user);

      const result = await service.findOne(user.id);
      expect(result).toBeDefined();
      expect(result.firstName).toBe('Jane');
    });

    it('should return undefined if user not found', async () => {
      await expect(service.findOne(999)).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('should create and return a new user', async () => {
      const createUserDto: CreateUserDto = {
        firstName: 'Mark',
        lastName: 'Twain',
        membershipType: 'Annual Basic',
        startDate: new Date().toISOString(),
        totalAmount: 200,
        email: 'mark@example.com',
        dueDate: new Date(),
        monthlyDueDate: new Date(),
        monthlyAmount: 0,
        isFirstMonth: true,
        invoiceLink: 'https://example.com/invoice/1',
      };

      const result = await service.create(createUserDto);
      expect(result).toBeDefined();
      expect(result.firstName).toBe('Mark');

      const userInDb = await repository.findOne({ where: { id: result.id } });
      expect(userInDb).toBeDefined();
      expect(userInDb.firstName).toBe('Mark');
    });
  });

  describe('update', () => {
    it('should update and return the updated user', async () => {
      const user = repository.create({
        firstName: 'Anna',
        lastName: 'Smith',
        membershipType: 'Monthly Premium',
        startDate: new Date(),
        totalAmount: 300,
        email: 'anna@example.com',
        dueDate: new Date(),
        monthlyDueDate: new Date(),
        monthlyAmount: 0,
        isFirstMonth: true,
        invoiceLink: 'https://example.com/invoice/1',
      });
      await repository.save(user);

      const updateUserDto: UpdateUserDto = {
        lastName: 'Johnson',
      };

      const result = await service.update(user.id, updateUserDto);
      expect(result).toBeDefined();
      expect(result.lastName).toBe('Johnson');

      const userInDb = await repository.findOne({ where: { id: user.id } });
      expect(userInDb).toBeDefined();
      expect(userInDb.lastName).toBe('Johnson');
    });

    it('should throw an error if user not found', async () => {
      const updateUserDto: UpdateUserDto = {
        lastName: 'Johnson',
      };

      await expect(service.update(999, updateUserDto)).rejects.toThrow();
    });
  });

  describe('remove', () => {
    it('should remove the user', async () => {
      const user = repository.create({
        firstName: 'Tom',
        lastName: 'Hardy',
        membershipType: 'Annual Basic',
        startDate: new Date(),
        totalAmount: 400,
        email: 'tom@example.com',
        dueDate: new Date(),
        monthlyDueDate: new Date(),
        monthlyAmount: 0,
        isFirstMonth: true,
        invoiceLink: 'https://example.com/invoice/1',
      });
      await repository.save(user);

      await service.remove(user.id);

      const userInDb = await repository.findOne({ where: { id: user.id } });
      expect(userInDb).toBeNull();
    });

    it('should throw an error if user not found', async () => {
      await expect(service.remove(999)).rejects.toThrow();
    });
  });

  describe('findDueUsers', () => {
    it('should return users with due dates', async () => {
      const user1 = repository.create({
        firstName: 'Alice',
        lastName: 'Wonderland',
        membershipType: 'Annual Basic',
        startDate: new Date(),
        dueDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // Due in 7 days
        totalAmount: 500,
        email: 'alice@example.com',
        monthlyDueDate: new Date(),
        monthlyAmount: 0,
        isFirstMonth: true,
        invoiceLink: 'https://example.com/invoice/1',
      });
      const user2 = repository.create({
        firstName: 'Bob',
        lastName: 'Builder',
        membershipType: 'Monthly Premium',
        startDate: new Date(),
        monthlyDueDate: new Date(),
        totalAmount: 100,
        email: 'bob@example.com',
        dueDate: new Date(),
        monthlyAmount: 0,
        isFirstMonth: true,
        invoiceLink: 'https://example.com/invoice/1',
      });
      await repository.save([user1, user2]);

      const result = await service.findDueUsers();
      expect(result).toHaveLength(1);
    });
  });
});
