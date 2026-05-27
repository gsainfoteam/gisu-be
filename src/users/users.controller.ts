import { Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('유저 (Users)')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('session')
  @ApiOperation({ summary: '임시 유저 토큰 발급', description: '접속 시 최초 1회 호출하여 UUID를 발급받습니다.' })
  createSession() {
    return this.usersService.createGuestUser();
  }
}
