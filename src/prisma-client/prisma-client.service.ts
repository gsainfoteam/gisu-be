import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
// 💡 방금 설치한 2개의 라이브러리를 불러와!
import { Pool } from 'pg'; 
import { PrismaPg } from '@prisma/adapter-pg'; 

@Injectable()
export class PrismaClientService extends PrismaClient implements OnModuleInit {
  constructor() {
    // 1. PostgreSQL 데이터베이스와 연결할 선(Pool)을 만든다.
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    // 2. 프리즈마 7버전 전용 어댑터에 그 선을 꽂는다.
    const adapter = new PrismaPg(pool);
    
    // 3. 부모(PrismaClient)에게 완성된 어댑터를 쥐여준다!
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}