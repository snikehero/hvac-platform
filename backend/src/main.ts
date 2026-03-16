import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  const port = config.get<number>('PORT', 3000);
  const corsOrigin = config.get<string>('CORS_ORIGIN', '*');

  app.enableCors({ origin: corsOrigin });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false }),
  );

  // Swagger / OpenAPI
  const swaggerConfig = new DocumentBuilder()
    .setTitle('FireIIOT Platform API')
    .setDescription('REST API for industrial IoT machine monitoring and machine type management')
    .setVersion('1.0')
    .addTag('Machine Types', 'CRUD for machine type definitions')
    .addTag('Machine Snapshots', 'Real-time telemetry snapshots')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port);
  logger.log(`Server listening on port ${port}`);
  logger.log(`Swagger docs available at http://localhost:${port}/api/docs`);
}
bootstrap();
