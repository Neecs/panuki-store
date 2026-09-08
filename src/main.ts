import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { validationPipeOptions } from './config/pipe/validation-pipe.config';

async function bootstrap() {
  const logger = new Logger('Application');
  const app = await NestFactory.create(AppModule, { logger });
  app.useGlobalPipes(new ValidationPipe(validationPipeOptions));
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? 3000;
  await app.listen(port);
  logger.log(`Application running on port ${port}`);
}
void bootstrap();
