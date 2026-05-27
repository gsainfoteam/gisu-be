import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaClientService } from '../prisma-client/prisma-client.service';

@Injectable()
export class EnrollmentsService {
  constructor(private prisma: PrismaClientService) {}

  async enroll(token: string, sectionId: number) {
    // 1. 유저 확인
    const user = await this.prisma.user.findUnique({ where: { token } });
    if (!user) throw new NotFoundException('유효하지 않은 유저 토큰입니다.');

    // 2. 신청하려는 수업 가져오기 (💡 include로 TimeSlot 테이블 같이 가져오기!)
    const newSection = await this.prisma.section.findUnique({ 
      where: { id: sectionId },
      include: { timeSlots: true } 
    });
    if (!newSection) throw new NotFoundException('해당 수업을 찾을 수 없습니다.');

    // 3. 기존 수강 내역 쫙 긁어오기 (💡 중첩 include로 분반에 딸린 시간표까지 싹 가져오기!)
    const existingEnrollments = await this.prisma.enrollment.findMany({
      where: { userId: user.id },
      include: { 
        section: {
          include: { timeSlots: true }
        } 
      }, 
    });

    // 💡 기존 시간표 객체들에서 'slotCode'(예: A3, A4) 글자만 뽑아서 1차원 배열로 만들기
    const existingTimeSlotCodes = existingEnrollments.flatMap(e => 
      e.section.timeSlots.map(ts => ts.slotCode)
    );

    // 4. 교집합(중복) 검증! 
    // 💡 새로 신청할 시간표의 slotCode가 기존 배열에 하나라도 있는지 확인
    const hasConflict = newSection.timeSlots.some(newSlot => 
      existingTimeSlotCodes.includes(newSlot.slotCode)
    );
    
    if (hasConflict) {
      throw new BadRequestException('이미 신청한 과목과 시간표가 겹칩니다!');
    }

    // 5. 중복이 없다면 수강신청 저장!
    const enrollment = await this.prisma.enrollment.create({
      data: {
        userId: user.id,
        sectionId: sectionId,
      },
    });

    return { message: '수강신청(담기) 성공!', enrollment };
  }
}