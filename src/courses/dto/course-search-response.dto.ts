// src/courses/dto/course-search-response.dto.ts

import { ApiProperty } from '@nestjs/swagger';

export class CourseSearchResponseDto {
  @ApiProperty({ example: 1, description: '분반 ID. Add 버튼 클릭 시 이 값을 사용합니다.' })
  sectionId!: number;

  @ApiProperty({ example: 1, description: '과목 ID' })
  courseId!: number;

  @ApiProperty({ example: 'GS1001', description: '과목 코드' })
  courseCode!: string;

  @ApiProperty({ example: 'GS1001-01', description: '과목 코드 + 분반 번호' })
  courseSectionCode!: string;

  @ApiProperty({
    example: 'Single Variable Calculus and Applications',
    description: '과목명',
  })
  title!: string;

  @ApiProperty({ example: 'M', description: '과목 유형 M/E/R' })
  type!: string;

  @ApiProperty({ example: 3, description: '학점' })
  credit!: number;

  @ApiProperty({ example: '01', description: '분반 번호' })
  sectionNo!: string;

  @ApiProperty({ example: 'Kim, Gildong', description: '담당 교수' })
  instructor!: string;

  @ApiProperty({ example: 40, description: '최대 정원' })
  maxCapacity!: number;

  @ApiProperty({ example: 0, description: '현재 신청 인원' })
  currentSeats!: number;

  @ApiProperty({ example: 40, description: '남은 자리 수' })
  remainingSeats!: number;

  @ApiProperty({
    example: 'MON 09:00~10:30 | WED 09:00~10:30',
    description: '사용자에게 보여줄 시간표 문자열',
    required: false,
    nullable: true,
  })
  timetableText!: string | null;

  @ApiProperty({
    example: ['A04', 'A05', 'A06'],
    description: '시간표 중복 검사 및 UI 색칠에 쓰는 슬롯 코드',
    type: [String],
  })
  timeSlots!: string[];
}