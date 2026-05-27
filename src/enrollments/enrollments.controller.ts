import { Controller, Post, Body } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('수강신청 (Enrollments)')
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  @ApiOperation({ summary: '과목 담기', description: '토큰과 분반 ID를 보내면 시간표 중복 검증 후 담습니다.' })
  enroll(
    @Body('token') token: string,
    @Body('sectionId') sectionId: number,
  ) {
    return this.enrollmentsService.enroll(token, sectionId);
  }
}
