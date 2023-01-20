import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api')

  app.enableCors({
    credentials: true,
    origin: process.env.HOST
  });
  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser())

  const options = new DocumentBuilder().setTitle('User Dashboard')
                                       .setDescription('User Dashboard Application')
                                       .setVersion('1.0')
                                       .build();

  const document = SwaggerModule.createDocument(app, options)
  SwaggerModule.setup('apidoc', app, document)

  const PORT = process.env.PORT || 3000
  await app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
bootstrap();
