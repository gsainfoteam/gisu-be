import { Global, Module } from '@nestjs/common';
import { PrismaClientService } from './prisma-client.service';

@Global() // 💡 글로벌 모듈로 만들어서 다른 폴더에서 일일이 import 안 해도 되게 설정!
@Module({
  providers: [PrismaClientService],
  exports: [PrismaClientService],
})
export class PrismaClientModule {}