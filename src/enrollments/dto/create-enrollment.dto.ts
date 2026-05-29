import { ApiProperty } from '@nestjs/swagger';

export class CreateEnrollmentDto {
  @ApiProperty({
    example: 'uuid-token-here',
    description: 'POST /users/session에서 발급받은 사용자 토큰',
  })
  token!: string;

  @ApiProperty({
    example: 1,
    description: '사용자가 Add 버튼을 누른 분반의 sectionId',
  })
  sectionId!: number;
}