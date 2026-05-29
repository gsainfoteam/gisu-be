// src/enrollments/enrollments.controller.ts

import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiQuery, ApiTags } from '@nestjs/swagger';
import { EnrollmentsService } from './enrollments.service';

class EnrollDto {
  @ApiProperty({ example: 'uuid-token-here' })
  token!: string;

  @ApiProperty({ example: 1 })
  sectionId!: number;
}

@ApiTags('Enrollment')
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  @ApiOperation({
    summary: '수강신청 담기',
    description:
      '시간표 중복, 동일 과목 중복, 정원 초과를 검사하고 과목을 담습니다.',
  })
  enroll(@Body() dto: EnrollDto) {
    return this.enrollmentsService.enroll(dto.token, dto.sectionId);
  }

  @Get('my')
  @ApiOperation({
    summary: '내 수강신청 목록 조회',
    description:
      '사용자가 담은 과목 목록과 오른쪽 시간표 색칠에 필요한 데이터를 반환합니다.',
  })
  @ApiQuery({
    name: 'token',
    required: true,
    description: 'POST /users/session에서 발급받은 사용자 토큰',
  })
  findMyEnrollments(@Query('token') token: string) {
    return this.enrollmentsService.findMyEnrollments(token);
  }
}