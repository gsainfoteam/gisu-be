import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //swagger 설정
  const config = new DocumentBuilder()
    .setTitle('GISU API') 
    .setDescription('지스트 수강신청 연습 사이트 백엔드 API 문서입니다.')
    .build();
    
  // 스웨거 문서 객체 생성
  const document = SwaggerModule.createDocument(app, config);
  
  // '/api' 주소로 접속하면 스웨거 화면이 나오도록 세팅
  SwaggerModule.setup('api', app, document); // http://localhost:3000/api
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
