import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TravelPlan } from './entities/travel-plan.entity';
import { TravelPlansService } from './services/travel-plans.service';
import { TravelPlansController } from './controllers/travel-plans.controller';
import { CountriesModule } from '../countries/countries.module';

/**
 * Módulo de Planes de Viaje - Interfaz Pública
 * 
 * Este es el único módulo que expone servicios al cliente final
 * para la gestión de planes de viaje.
 * 
 * Integración:
 * - Importa CountriesModule para acceder al servicio de países
 * - El CountriesService resuelve la existencia de países (caché local o API externa)
 * - antes de permitir que el plan de viaje se guarde
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([TravelPlan]),
    CountriesModule, // Importa el módulo de países para usar su servicio
  ],
  controllers: [TravelPlansController],
  providers: [TravelPlansService],
})
export class TravelPlansModule {}
