// src/courses/courses.controller.ts

import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CourseSearchResponseDto } from './dto/course-search-response.dto';

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get('search')
  @ApiOperation({
    summary: '과목 검색',
    description:
      '사용자가 Course No/Title 검색창에 입력한 값으로 과목을 검색하고, 해당 과목의 모든 분반을 반환합니다.',
  })
  @ApiQuery({
    name: 'keyword',
    required: false,
    description: '과목 코드 또는 과목명 검색어',
  })
  @ApiOkResponse({
    description: '검색된 과목 분반 목록',
    type: CourseSearchResponseDto,
    isArray: true,
  })
  search(@Query('keyword') keyword?: string) {
    return this.coursesService.search(keyword ?? '');
  }

  @Get()
  @ApiOperation({
    summary: '전체 과목 조회',
    description: '전체 과목과 분반 목록을 반환합니다.',
  })
  @ApiOkResponse({
    description: '전체 과목 분반 목록',
    type: CourseSearchResponseDto,
    isArray: true,
  })
  findAll() {
    return this.coursesService.search('');
  }
}
//course no/title 검색창 api