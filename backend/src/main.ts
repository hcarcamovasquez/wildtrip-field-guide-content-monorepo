import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const allowedOrigins = configService.get<string[]>('cors.origins') || [
    'http://localhost:4321',
    'http://localhost:5173',
  ];

  // Use cookie parser
  app.use(cookieParser());

  // Enable CORS
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const port = configService.get<number>('port') || 3000;
  await app.listen(port);

  console.log(`🚀 Server running on http://localhost:${port}`);
}

void bootstrap();
