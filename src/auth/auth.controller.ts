import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { User } from 'src/users/user.decorator';
import { UsersService } from 'src/users/users.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Registers a new user for the authenticated user
   * @param createUserDto
   */
  @UseGuards(JwtAuthGuard)
  @Post('/register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  /**
   *
   * @param id Logs in the authenticated user's auth0Id and returns the user id in our db
   */
  @UseGuards(JwtAuthGuard)
  @Post('/login')
  async findOne(@User('sub') id: string) {
    const user = await this.usersService.findOneByAuth0Id(id);
    return { id: user?.id };
  }
}
