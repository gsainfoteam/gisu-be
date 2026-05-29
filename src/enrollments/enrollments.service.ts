// src/enrollments/enrollments.service.ts

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClientService } from '../prisma-client/prisma-client.service';

@Injectable()
export class EnrollmentsService {
  constructor(private readonly prisma: PrismaClientService) {}

  async enroll(token: string, sectionId: number) {
    const trimmedToken = token?.trim();
    const parsedSectionId = Number(sectionId);

    if (!trimmedToken) {
      throw new BadRequestException('사용자 토큰이 필요합니다.');
    }

    if (!parsedSectionId || Number.isNaN(parsedSectionId)) {
      throw new BadRequestException('올바른 sectionId가 필요합니다.');
    }

    // 1. 유저 토큰으로 유저 찾기
    const user = await this.prisma.user.findUnique({
      where: { token: trimmedToken },
    });

    if (!user) {
      throw new NotFoundException('유효하지 않은 토큰입니다.');
    }

    // 2. 새로 신청하려는 분반 정보 가져오기
    const newSection = await this.prisma.section.findUnique({
      where: { id: parsedSectionId },
      include: {
        course: true,
        timeSlots: true,
      },
    });

    if (!newSection) {
      throw new NotFoundException('수업을 찾을 수 없습니다.');
    }

    // 3. 같은 분반 중복 신청 방지
    const alreadyEnrolledSameSection = await this.prisma.enrollment.findFirst({
      where: {
        userId: user.id,
        sectionId: parsedSectionId,
      },
    });

    if (alreadyEnrolledSameSection) {
      throw new BadRequestException('이미 신청한 분반입니다.');
    }

    // 4. 같은 과목의 다른 분반 중복 신청 방지
    const alreadyEnrolledSameCourse = await this.prisma.enrollment.findFirst({
      where: {
        userId: user.id,
        section: {
          courseId: newSection.courseId,
        },
      },
      include: {
        section: {
          include: {
            course: true,
          },
        },
      },
    });

    if (alreadyEnrolledSameCourse) {
      throw new BadRequestException(
        `이미 신청한 과목입니다: ${alreadyEnrolledSameCourse.section.course.code}`,
      );
    }

    // 5. 정원 초과 방지
    if (newSection.currentSeats >= newSection.maxCapacity) {
      throw new BadRequestException('정원이 초과되었습니다.');
    }

    // 6. 내가 이미 신청한 과목들의 시간표 가져오기
    const myEnrollments = await this.prisma.enrollment.findMany({
      where: {
        userId: user.id,
      },
      include: {
        section: {
          include: {
            course: true,
            timeSlots: true,
          },
        },
      },
    });

    // 7. 시간표 중복 검사
    const myExistingSlots = myEnrollments.flatMap((enrollment) =>
      enrollment.section.timeSlots.map((slot) => slot.slotCode),
    );

    const newSectionSlots = newSection.timeSlots.map((slot) => slot.slotCode);

    const conflictSlots = newSectionSlots.filter((slot) =>
      myExistingSlots.includes(slot),
    );

    if (conflictSlots.length > 0) {
      throw new BadRequestException(
        `시간표가 중복됩니다: ${conflictSlots.join(', ')}`,
      );
    }

    // 8. 수강신청 저장 + 현재 신청 인원 증가
    try {
      await this.prisma.$transaction(async (tx) => {
        const latestSection = await tx.section.findUnique({
          where: {
            id: parsedSectionId,
          },
          select: {
            currentSeats: true,
            maxCapacity: true,
          },
        });

        if (!latestSection) {
          throw new NotFoundException('수업을 찾을 수 없습니다.');
        }

        if (latestSection.currentSeats >= latestSection.maxCapacity) {
          throw new BadRequestException('정원이 초과되었습니다.');
        }

        await tx.enrollment.create({
          data: {
            userId: user.id,
            sectionId: parsedSectionId,
          },
        });

        await tx.section.update({
          where: {
            id: parsedSectionId,
          },
          data: {
            currentSeats: {
              increment: 1,
            },
          },
        });
      });
    } catch (error: unknown) {
      if (this.isPrismaUniqueError(error)) {
        throw new BadRequestException('이미 신청한 분반입니다.');
      }

      throw error;
    }

    // 9. 신청 성공 후 최신 내 수강신청 목록 반환
    return this.findMyEnrollments(trimmedToken);
  }

  async findMyEnrollments(token: string) {
    const trimmedToken = token?.trim();

    if (!trimmedToken) {
      throw new BadRequestException('사용자 토큰이 필요합니다.');
    }

    const user = await this.prisma.user.findUnique({
      where: {
        token: trimmedToken,
      },
    });

    if (!user) {
      throw new NotFoundException('유효하지 않은 토큰입니다.');
    }

    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        userId: user.id,
      },
      include: {
        section: {
          include: {
            course: true,
            timeSlots: {
              orderBy: {
                slotCode: 'asc',
              },
            },
          },
        },
      },
      orderBy: {
        id: 'asc',
      },
    });

    const registeredCourses = enrollments.map((enrollment) => {
      const section = enrollment.section;
      const course = section.course;

      return {
        enrollmentId: enrollment.id,
        sectionId: section.id,
        courseId: course.id,
        courseCode: course.code,
        courseSectionCode: `${course.code}-${section.sectionNo}`,
        title: course.title,
        type: course.type,
        credit: course.credit,
        sectionNo: section.sectionNo,
        instructor: section.instructor,
        timetableText: section.timetableText,
        timeSlots: section.timeSlots.map((slot) => slot.slotCode),
      };
    });

    const timetableBlocks = enrollments.flatMap((enrollment) => {
      const section = enrollment.section;
      const course = section.course;

      return section.timeSlots.map((slot) => ({
        slotCode: slot.slotCode,
        courseCode: course.code,
        courseSectionCode: `${course.code}-${section.sectionNo}`,
        title: course.title,
        sectionNo: section.sectionNo,
        label: course.code,
      }));
    });

    const totalCredits = registeredCourses.reduce(
      (sum, course) => sum + course.credit,
      0,
    );

    return {
      totalCourses: registeredCourses.length,
      totalCredits,
      registeredCourses,
      timetableBlocks,
    };
  }

  private isPrismaUniqueError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: string }).code === 'P2002'
    );
  }
}