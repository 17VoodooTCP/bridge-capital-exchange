import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Chat attachments and QR uploads are inlined as base64 data URLs, which far
  // exceed the default 100kb body limit — raise it so those requests succeed.
  app.use(json({ limit: '15mb' }));
  app.use(urlencoded({ extended: true, limit: '15mb' }));

  app.setGlobalPrefix('api');

  // Allow every legitimate frontend origin: the apex domain, www, the Vercel
  // deployment, localhost, plus any extra hosts listed in FRONTEND_URL
  // (comma-separated). Requests with no Origin (curl, server-to-server) pass.
  const allowedOrigins = new Set(
    [
      'https://bridgecapitalv1.com',
      'https://www.bridgecapitalv1.com',
      'https://bridge-capital-exchange.vercel.app',
      'http://localhost:3000',
      ...(process.env.FRONTEND_URL || '').split(',').map((s) => s.trim()),
    ].filter(Boolean),
  );

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: false }),
  );

  const config = new DocumentBuilder()
    .setTitle('Bridge Capital API')
    .setDescription('Multi-asset trading and investment platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Bridge Capital API running on http://localhost:${port}/api`);
  console.log(`📚 Swagger docs at http://localhost:${port}/api/docs`);
}
bootstrap();
