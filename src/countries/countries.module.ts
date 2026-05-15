import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { Country } from './entities/country.entity';
import { CountriesService } from './services/countries.service';
import { RestCountriesProvider } from './providers/rest-countries.provider';

/**
 * Módulo de Países - Lógica Interna
 * 
 * Este módulo se encarga de la gestión de datos geográficos para uso exclusivo
 * de otros módulos de la aplicación. NO expone controladores ni endpoints públicos.
 * 
 * Implementa una lógica de caché local:
 * - Busca países primero en la base de datos local
 * - Si no existe, consulta la API externa RestCountries
 * - Almacena la respuesta en BD para futuras solicitudes
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Country]),
    HttpModule.register({
      timeout: 10000, // 10 segundos de timeout
      maxRedirects: 5,
    }),
  ],
  providers: [
    CountriesService,
    RestCountriesProvider,
  ],
  exports: [
    CountriesService,
  ],
})
export class CountriesModule {}
