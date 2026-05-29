import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaClientModule } from './prisma-client/prisma-client.module';
import { UsersModule } from './users/users.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { CoursesModule } from './courses/courses.module';


@Module({
  imports: [PrismaClientModule, UsersModule, EnrollmentsModule, CoursesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}