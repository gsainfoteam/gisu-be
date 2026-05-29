import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS 설정: 프론트엔드에서 백엔드 API 호출 가능하게 허용
  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'ngrok-skip-browser-warning',
    ],
    credentials: true,
  });

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('GISU API')
    .setDescription('지스트 수강신청 연습 사이트 백엔드 API 문서입니다.')
    .setVersion('1.0')
    .build();

  // 스웨거 문서 객체 생성
  const document = SwaggerModule.createDocument(app, config);

  // '/api' 주소로 접속하면 스웨거 화면이 나오도록 세팅
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ?? 3000;

  // 0.0.0.0으로 열어야 ngrok이나 외부 접속에서 안정적으로 접근 가능
  await app.listen(port, '0.0.0.0');
}

bootstrap();