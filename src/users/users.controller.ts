import { Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('유저 (Users)')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('session')
  @ApiOperation({ summary: '임시 유저 토큰 발급', description: '최초 접속 시 호출하여 UUID 토큰을 발급받습니다.' })
  createSession() {
    return this.usersService.createGuestUser();
  }
}
