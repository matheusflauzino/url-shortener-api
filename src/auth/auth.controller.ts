import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  async register(@Body('username') username: string, @Body('password') password: string) {
    const user = await this.usersService.create(username, password);
    return { id: user.id, username: user.username };
  }

  @Post('login')
  async login(@Body('username') username: string, @Body('password') password: string) {
    const user = await this.authService.validateUser(username, password);
    return this.authService.login(user.id);
  }
}
