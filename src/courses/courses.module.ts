// src/courses/courses.module.ts

import { Module } from '@nestjs/common';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { PrismaClientModule } from '../prisma-client/prisma-client.module';

@Module({
  imports: [PrismaClientModule],
  controllers: [CoursesController],
  providers: [CoursesService],
})
export class CoursesModule {}