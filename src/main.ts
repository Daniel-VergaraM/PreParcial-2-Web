import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configuración de validación global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,           // Elimina propiedades no definidas en los DTOs
    forbidNonWhitelisted: true, // Lanza error si hay propiedades no definidas
    transform: true,            // Transforma los tipos automáticamente
  }));

  // Prefijo global opcional para la API
  // app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 Travel Plans API is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation:`);
  console.log(`   POST   /travel-plans     - Create travel plan`);
  console.log(`   GET    /travel-plans     - List all travel plans`);
  console.log(`   GET    /travel-plans/:id - Get travel plan by ID`);
  console.log(`   PATCH  /travel-plans/:id - Update travel plan`);
  console.log(`   DELETE /travel-plans/:id - Delete travel plan`);
}

bootstrap();
