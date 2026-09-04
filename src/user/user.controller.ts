import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createAdmin(@Body() userData: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.userService.createAdmin(
      userData.email,
      userData.password,
    );
    return new UserResponseDto(user.id, user.email);
  }
}
