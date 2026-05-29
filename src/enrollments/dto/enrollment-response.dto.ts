// src/enrollments/dto/enrollment-response.dto.ts

import { ApiProperty } from '@nestjs/swagger';

export class RegisteredCourseDto {
  @ApiProperty({ example: 1, description: '수강신청 내역 ID' })
  enrollmentId!: number;

  @ApiProperty({ example: 1, description: '분반 ID' })
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

  @ApiProperty({
    example: 'MON 09:00~10:30 | WED 09:00~10:30',
    description: '사용자에게 보여줄 시간표 문자열',
    required: false,
    nullable: true,
  })
  timetableText!: string | null;

  @ApiProperty({
    example: ['A04', 'A05', 'A06'],
    description: '해당 분반의 시간표 슬롯 코드',
    type: [String],
  })
  timeSlots!: string[];
}

export class TimetableBlockDto {
  @ApiProperty({ example: 'A04', description: '시간표 칸 코드' })
  slotCode!: string;

  @ApiProperty({ example: 'GS1001', description: '과목 코드' })
  courseCode!: string;

  @ApiProperty({ example: 'GS1001-01', description: '과목 코드 + 분반 번호' })
  courseSectionCode!: string;

  @ApiProperty({
    example: 'Single Variable Calculus and Applications',
    description: '과목명',
  })
  title!: string;

  @ApiProperty({ example: '01', description: '분반 번호' })
  sectionNo!: string;

  @ApiProperty({
    example: 'GS1001',
    description: '프론트 시간표 칸에 표시할 텍스트',
  })
  label!: string;
}

export class EnrollmentResponseDto {
  @ApiProperty({ example: 2, description: '현재 신청한 과목 수' })
  totalCourses!: number;

  @ApiProperty({ example: 6, description: '현재 신청한 총 학점' })
  totalCredits!: number;

  @ApiProperty({
    type: [RegisteredCourseDto],
    description: '아래쪽 List of course registration에 표시할 신청 과목 목록',
  })
  registeredCourses!: RegisteredCourseDto[];

  @ApiProperty({
    type: [TimetableBlockDto],
    description: '오른쪽 시간표 UI 색칠에 필요한 데이터',
  })
  timetableBlocks!: TimetableBlockDto[];
}