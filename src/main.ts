import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json } from 'stream/consumers';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //establecer limite de carga de archivos

  app.enableCors();
  app.setGlobalPrefix("delphi");
  app.useGlobalPipes(new ValidationPipe(
    {
      //whitelist: true,
      //forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      }
    }
  ));


  const config = new DocumentBuilder().setTitle('Admin Tenis API').setDescription('The Admind Tenis API description').setVersion('1.0').addTag('adminTenis').build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document);

  console.log('Api Corriendo correctamente',process.env.NODE_ENV) 
  await app.listen(3000);
}
bootstrap();
