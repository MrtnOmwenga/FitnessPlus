import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existing_user = await this.usersRepository.findOne({ where: { email: createUserDto.email } });

    if (existing_user) {
      throw new ConflictException('User not found');
    }

    const startDate = new Date(createUserDto.startDate);
    
    const user = this.usersRepository.create({ ...createUserDto, startDate });
    return this.usersRepository.save(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    console.log(updateUserDto.monthlyAmount);

    await this.usersRepository.update(id, updateUserDto);
    return this.usersRepository.findOne({ where: {id} });
  }

  async remove(id: number): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    await this.usersRepository.delete(id);
  }

  async findDueUsers(): Promise<User[]> {
    const currentDate = new Date();

    const dueUsers = await this.usersRepository
      .createQueryBuilder('user')
      .where('(user.dueDate >= :currentDate OR user.monthlyDueDate >= :currentDate)', { currentDate })
      .getMany();

    return dueUsers;
  }
}
