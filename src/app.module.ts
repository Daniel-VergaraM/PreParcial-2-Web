import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CountriesModule } from './countries/countries.module';
import { TravelPlansModule } from './travel-plans/travel-plans.module';
import { UsersModule } from './users/users.module';
import { TelemetryMiddleware } from './common/middleware/telemetry.middleware';

@Module({
  imports: [
    // Configuración de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // Configuración de base de datos MySQL con TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 3306),
        username: configService.get('DB_USERNAME', 'root'),
        password: configService.get('DB_PASSWORD', 'password'),
        database: configService.get('DB_NAME', 'travel_plans_db'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get<boolean>('DB_SYNCHRONIZE', true),
        logging: configService.get<boolean>('DB_LOGGING', false),
      }),
      inject: [ConfigService],
    }),
    
    // Módulos de la aplicación
    CountriesModule,    // Módulo interno - sin endpoints públicos
    TravelPlansModule, UsersModule,  // Módulo público - expone REST API
  ],
})
export class AppModule implements NestModule {
  /**
   * Configura el middleware de telemetría para los módulos
   * de viajes y usuarios.
   */
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TelemetryMiddleware)
      .forRoutes('travel-plans', 'users');
  }
}
