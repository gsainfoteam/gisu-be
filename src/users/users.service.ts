import { Injectable } from '@nestjs/common';
import { PrismaClientService } from '../prisma-client/prisma-client.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaClientService) {}

  async createGuestUser() {
    const newToken = uuidv4(); // 예: '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'
    
    // DB 유저 테이블에 저장
    const user = await this.prisma.user.create({
      data: { token: newToken },
    });

    return { message: '임시 유저 발급 성공', token: user.token };
  }
}
