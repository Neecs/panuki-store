import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './model/user.entity';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async createAdmin(email: string, passwordHash: string): Promise<User> {
    const existingUser = await this.findByEmail(email);

    if (existingUser) {
      this.logger.warn('Attempted to create admin that already exists');
      throw new ConflictException('Admin user already exists');
    }

    const user = this.userRepository.create({ email, passwordHash });
    const savedUser = await this.userRepository.save(user);

    this.logger.log(`Admin user created with id ${savedUser.id}`);
    return savedUser;
  }
}
