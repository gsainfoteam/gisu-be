// src/enrollments/enrollments.module.ts

import { Module } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentsController } from './enrollments.controller';
import { PrismaClientModule } from '../prisma-client/prisma-client.module';

@Module({
  imports: [PrismaClientModule],
  controllers: [EnrollmentsController],
  providers: [EnrollmentsService],
})
export class EnrollmentsModule {}