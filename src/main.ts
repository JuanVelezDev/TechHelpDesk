import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

 
  app.setGlobalPrefix('api');

  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,              
      forbidNonWhitelisted: true,   
      transform: true              
    }),
  );

  // Interceptor global para formatear respuestas
  app.useGlobalInterceptors(new TransformInterceptor());

  // Filtro global para manejar excepciones
  app.useGlobalFilters(new HttpExceptionFilter());

  
  const config = new DocumentBuilder()
    .setTitle('TechHelpDesk API')
    .setDescription('API para gestión de tickets de soporte técnico')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  
  const port = process.env.PORT || 3005;
  await app.listen(port);

  console.log(` API corriendo en http://localhost:${port}/api`);
  console.log(` Swagger en http://localhost:${port}/api/docs`);
}

bootstrap();
