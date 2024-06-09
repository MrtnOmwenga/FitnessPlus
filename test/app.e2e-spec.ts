import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { User } from '../src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let repository: Repository<User>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    repository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
  });

  afterAll(async () => {
    await repository.query('TRUNCATE TABLE members RESTART IDENTITY CASCADE'); 
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/users/:id (GET)', async () => {
    const createUserDto = {
      firstName: 'Test',
      lastName: 'User',
      membershipType: 'Annual Basic',
      totalAmount: 400,
      monthlyAmount: 100,
      email: 'test@example.com',
      invoiceLink: 'https://example.com/invoice/3',
    };

    const createUserResponse = await request(app.getHttpServer())
      .post('/users')
      .send(createUserDto)
      .expect(201);

    const userId = createUserResponse.body.id;

    const findUserResponse = await request(app.getHttpServer()).get(`/users/${userId}`);
    expect(findUserResponse.status).toBe(200);
    expect(findUserResponse.body.firstName).toEqual(createUserDto.firstName);
    expect(findUserResponse.body.lastName).toEqual(createUserDto.lastName);
  });

  it('/users (GET)', async () => {
    const response = await request(app.getHttpServer()).get('/users').expect(200);

    expect(response.body).toHaveLength(1);
  });

  it('/users (POST)', async () => {
    const createUserDto = {
      firstName: 'Mark',
      lastName: 'Twain',
      membershipType: 'Annual Basic',
      startDate: new Date(),
      totalAmount: 200.0,
      monthlyAmount: 50.0,
      email: 'mark@example.com',
      invoiceLink: 'https://example.com/invoice/1',
    };

    const response = await request(app.getHttpServer())
      .post('/users')
      .send(createUserDto)
      .expect(201);
    
    expect(response.body.firstName).toEqual(createUserDto.firstName);
    expect(response.body.lastName).toEqual(createUserDto.lastName);
  });

  it('startDate should default to today', async () => {
    const createUserDto = {
      firstName: 'Johnny',
      lastName: 'Kimmel',
      membershipType: 'Annual Basic',
      totalAmount: 200.0,
      monthlyAmount: 50.0,
      email: 'kimmel@example.com',
      invoiceLink: 'https://example.com/invoice/1',
    };
    
    const response = await request(app.getHttpServer())
      .post('/users')
      .send(createUserDto)
      .expect(201);
    
    expect(response.body.firstName).toEqual(createUserDto.firstName);
    expect(response.body.lastName).toEqual(createUserDto.lastName);
    expect(response.body.startDate).not.toBeNull();
  });

  it('Should return 400 if email already in use', async () => {
    const createUserDto = {
      firstName: 'Mark',
      lastName: 'Twain',
      membershipType: 'Annual Basic',
      totalAmount: 200,
      email: 'mark@example.com',
    };

    const response = await request(app.getHttpServer())
      .post('/users')
      .send(createUserDto)
      .expect(400);
  });

  it('Shound return 400 if email format is wrong', async () => {
    const createUserDto = {
      firstName: 'Mark',
      lastName: 'Twain',
      membershipType: 'Annual Basic',
      totalAmount: 200,
      email: 'markexample.com',
    };

    await request(app.getHttpServer())
      .post('/users')
      .send(createUserDto)
      .expect(400);
  });

  it('Shound return 400 if invalid values', async () => {
    const createUserDto = {
      firstName: 'Mark',
      lastName: 'Twain',
      membershipType: 'Annual Basic',
      totalAmount: -200,
      monthlyAmount: -50,
      email: 'markexample.com',
    };

    await request(app.getHttpServer())
      .post('/users')
      .send(createUserDto)
      .expect(400);
  });

  it('/users/:id (PUT)', async () => {
    const updateUserDto = {
      lastName: 'Johnson',
    };

    const createUserDto = {
      firstName: 'Anna',
      lastName: 'Smith',
      membershipType: 'Monthly Premium',
      totalAmount: 300,
      monthlyAmount: 78,
      email: 'anna@example.com',
      invoiceLink: 'https://example.com/invoice/2',
    };

    const createUserResponse = await request(app.getHttpServer())
      .post('/users')
      .send(createUserDto)
      .expect(201);

    const userId = createUserResponse.body.id;

    const updateResponse = await request(app.getHttpServer())
      .put(`/users/${userId}`)
      .send(updateUserDto)
      .expect(200);
    
    expect(updateResponse.body.lastName).toEqual(updateUserDto.lastName);
  });

  it('/users/:id (PUT)', async () => {
    const updateUserDto = {
      monthlyAmount: -100,
    };

    const createUserDto = {
      firstName: 'Kendra',
      lastName: 'Smith',
      membershipType: 'Monthly Premium',
      totalAmount: 300,
      monthlyAmount: 78,
      email: 'kendra@example.com',
      invoiceLink: 'https://example.com/invoice/2',
    };

    const createUserResponse = await request(app.getHttpServer())
      .post('/users')
      .send(createUserDto)
      .expect(201);

    const userId = createUserResponse.body.id;

    await request(app.getHttpServer())
      .put(`/users/${userId}`)
      .send(updateUserDto)
      .expect(400);
  });

  it('/users/:id (DELETE)', async () => {
    const createUserDto = {
      firstName: 'Tom',
      lastName: 'Hardy',
      membershipType: 'Annual Basic',
      totalAmount: 400,
      monthlyAmount: 100,
      email: 'tom@example.com',
      invoiceLink: 'https://example.com/invoice/3',
    };

    const createUserResponse = await request(app.getHttpServer())
      .post('/users')
      .send(createUserDto)
      .expect(201);

    const userId = createUserResponse.body.id;

    await request(app.getHttpServer())
      .delete(`/users/${userId}`)
      .expect(204);

    const findUserResponse = await request(app.getHttpServer()).get(`/users/${userId}`);
    expect(findUserResponse.status).toBe(404);
  });
});
