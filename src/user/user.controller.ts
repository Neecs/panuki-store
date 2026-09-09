import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  createAdmin(@Body() userData: CreateUserDto) {
    return this.userService.createAdmin(userData.email, userData.password);
  }
}
