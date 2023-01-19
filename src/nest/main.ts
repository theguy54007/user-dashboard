import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    credentials: true,
    origin: 'http://localhost:4200'
  });
  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser())

  const options = new DocumentBuilder().setTitle('User Dashboard')
                                       .setDescription('User Dashboard Application')
                                       .setVersion('1.0')
                                       .build();

  const document = SwaggerModule.createDocument(app, options)
  SwaggerModule.setup('api', app, document)

  await app.listen(3000);
}
bootstrap();
