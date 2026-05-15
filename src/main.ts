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
  console.log(`   Headers requeridos para telemetría:`);
  console.log(`     x-user-id: ID del usuario que realiza la petición`);
  console.log(`   Usuarios:`);
  console.log(`     POST   /users               - Create user`);
  console.log(`     GET    /users               - List all users`);
  console.log(`     GET    /users/:id           - Get user by ID`);
  console.log(`     DELETE /users/:id           - Delete user`);
  console.log(`   Planes de Viaje:`);
  console.log(`     POST   /travel-plans        - Create travel plan (requiere userId válido)`);
  console.log(`     GET    /travel-plans        - List all travel plans`);
  console.log(`     GET    /travel-plans/:id    - Get travel plan by ID`);
  console.log(`     PATCH  /travel-plans/:id    - Update travel plan`);
  console.log(`     DELETE /travel-plans/:id    - Delete travel plan`);
  console.log(`     POST   /travel-plans/expenses - Add expense to travel plan`);
  console.log(`   Telemetría:`);
  console.log(`     Middleware registra: [User: {x-user-id}] accedió a {ruta} - {método}`);
  console.log(`     Si x-user-id no está presente: [User: ANONYMOUS]`);
}

bootstrap();
