import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TravelPlan } from './entities/travel-plan.entity';
import { TravelPlansService } from './services/travel-plans.service';
import { TravelPlansController } from './controllers/travel-plans.controller';
import { CountriesModule } from '../countries/countries.module';
import { UsersModule } from '../users/users.module';
import { Expense } from './entities/expense.entity';

/**
 * Módulo de Planes de Viaje - Interfaz Pública
 * 
 * Este es el único módulo que expone servicios al cliente final
 * para la gestión de planes de viaje.
 * 
 * Integración:
 * - Importa CountriesModule para acceder al servicio de países
 * - Importa UsersModule para validar la existencia de usuarios
 * - El CountriesService resuelve la existencia de países (caché local o API externa)
 * - El UsersService valida que el usuario exista antes de crear un plan
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([TravelPlan, Expense]),
    CountriesModule, // Importa el módulo de países para usar su servicio
    UsersModule, // Importa el módulo de usuarios para validar existencia
  ],
  controllers: [TravelPlansController],
  providers: [TravelPlansService],
})
export class TravelPlansModule {}
