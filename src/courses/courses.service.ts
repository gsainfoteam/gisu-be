// src/courses/courses.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaClientService } from '../prisma-client/prisma-client.service';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaClientService) {}

  async search(keyword: string) {
    const trimmedKeyword = keyword.trim();

    const courses = await this.prisma.course.findMany({
      where: trimmedKeyword
        ? {
            OR: [
              {
                code: {
                  contains: trimmedKeyword,
                  mode: 'insensitive',
                },
              },
              {
                title: {
                  contains: trimmedKeyword,
                  mode: 'insensitive',
                },
              },
            ],
          }
        : {},
      include: {
        sections: {
          include: {
            timeSlots: {
              orderBy: {
                slotCode: 'asc',
              },
            },
          },
          orderBy: {
            sectionNo: 'asc',
          },
        },
      },
      orderBy: {
        code: 'asc',
      },
    });

    return courses.flatMap((course) =>
      course.sections.map((section) => ({
        sectionId: section.id,
        courseId: course.id,
        courseCode: course.code,
        courseSectionCode: `${course.code}-${section.sectionNo}`,
        title: course.title,
        type: course.type,
        credit: course.credit,
        sectionNo: section.sectionNo,
        instructor: section.instructor,
        maxCapacity: section.maxCapacity,
        currentSeats: section.currentSeats,
        remainingSeats: section.maxCapacity - section.currentSeats,
        timetableText: section.timetableText,
        timeSlots: section.timeSlots.map((slot) => slot.slotCode),
      })),
    );
  }
}