import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
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

  await app.listen(port, '0.0.0.0');
  logger.log(`Server listening on 0.0.0.0:${port}`);
}
bootstrap();
