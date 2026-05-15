import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TravelPlan } from '../entities/travel-plan.entity';
import { CountriesService } from '../../countries/services/countries.service';
import { CreateTravelPlanDto } from '../dto/create-travel-plan.dto';
import { UpdateTravelPlanDto } from '../dto/update-travel-plan.dto';

export interface TravelPlanResponse {
  id: number;
  title: string;
  start_date: Date;
  end_date: Date;
  countries: Array<{
    alpha3_code: string;
    name: string;
    region: string;
    capital: string;
    flag_url: string;
  }>;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class TravelPlansService {
  private readonly logger = new Logger(TravelPlansService.name);

  constructor(
    @InjectRepository(TravelPlan)
    private readonly travelPlanRepository: Repository<TravelPlan>,
    private readonly countriesService: CountriesService,
  ) { }

  /**
   * Crea un nuevo plan de viaje.
   * Valida los países utilizando el servicio de países (con caché local).
   */
  async create(createDto: CreateTravelPlanDto): Promise<TravelPlanResponse> {
    const { title, start_date, end_date, country_codes } = createDto;

    // Validar que la fecha de fin sea posterior a la de inicio
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (endDate < startDate) {
      throw new BadRequestException('La fecha de fin debe ser posterior a la fecha de inicio');
    }

    // Normalizar códigos de país (mayúsculas)
    const normalizedCodes = country_codes.map(code => code.toUpperCase());

    // Validar y obtener países usando el servicio de países
    this.logger.log(`Validating countries for new travel plan: ${normalizedCodes.join(', ')}`);
    const countries = await this.countriesService.findOrCreateMultiple(normalizedCodes);

    // Verificar que todos los países fueron encontrados
    if (countries.length !== normalizedCodes.length) {
      const foundCodes = countries.map(c => c.alpha3_code);
      const notFoundCodes = normalizedCodes.filter(code => !foundCodes.includes(code));
      throw new BadRequestException(
        `Los siguientes códigos de país no fueron encontrados: ${notFoundCodes.join(', ')}`
      );
    }

    // Crear el plan de viaje
    const travelPlan = this.travelPlanRepository.create({
      title,
      start_date: startDate,
      end_date: endDate,
      countries,
    });

    const savedPlan = await this.travelPlanRepository.save(travelPlan);
    this.logger.log(`Travel plan created successfully with ID: ${savedPlan.id}`);

    return this.mapToResponse(savedPlan);
  }

  /**
   * Obtiene todos los planes de viaje con información de países.
   */
  async findAll(): Promise<TravelPlanResponse[]> {
    const plans = await this.travelPlanRepository.find({
      order: { created_at: 'DESC' },
    });

    return plans.map(plan => this.mapToResponse(plan));
  }

  /**
   * Obtiene un plan de viaje por su ID.
   */
  async findOne(id: number): Promise<TravelPlanResponse> {
    const plan = await this.travelPlanRepository.findOne({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundException(`Plan de viaje con ID ${id} no encontrado`);
    }

    return this.mapToResponse(plan);
  }

  /**
   * Actualiza un plan de viaje existente.
   */
  async update(id: number, updateDto: UpdateTravelPlanDto): Promise<TravelPlanResponse> {
    const plan = await this.travelPlanRepository.findOne({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundException(`Plan de viaje con ID ${id} no encontrado`);
    }

    // Actualizar campos básicos
    if (updateDto.title) {
      plan.title = updateDto.title;
    }

    if (updateDto.start_date) {
      plan.start_date = new Date(updateDto.start_date);
    }

    if (updateDto.end_date) {
      plan.end_date = new Date(updateDto.end_date);
    }

    // Validar fechas
    if (plan.end_date < plan.start_date) {
      throw new BadRequestException('La fecha de fin debe ser posterior a la fecha de inicio');
    }

    // Actualizar países si se proporcionan
    if (updateDto.country_codes && updateDto.country_codes.length > 0) {
      const normalizedCodes = updateDto.country_codes.map(code => code.toUpperCase());

      this.logger.log(`Updating countries for travel plan ${id}: ${normalizedCodes.join(', ')}`);
      const countries = await this.countriesService.findOrCreateMultiple(normalizedCodes);

      if (countries.length !== normalizedCodes.length) {
        const foundCodes = countries.map(c => c.alpha3_code);
        const notFoundCodes = normalizedCodes.filter(code => !foundCodes.includes(code));
        throw new BadRequestException(
          `Los siguientes códigos de país no fueron encontrados: ${notFoundCodes.join(', ')}`
        );
      }

      plan.countries = countries;
    }

    const updatedPlan = await this.travelPlanRepository.save(plan);
    this.logger.log(`Travel plan ${id} updated successfully`);


    return this.mapToResponse(updatedPlan);
  }

  /**
   * Elimina un plan de viaje.
   */
  async remove(id: number): Promise<void> {
    const plan = await this.travelPlanRepository.findOne({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundException(`Plan de viaje con ID ${id} no encontrado`);
    }

    await this.travelPlanRepository.remove(plan);
    this.logger.log(`Travel plan ${id} deleted successfully`);
  }

  /**
   * Mapea una entidad TravelPlan a la respuesta enriquecida.
   */
  private mapToResponse(plan: TravelPlan): TravelPlanResponse {
    return {
      id: plan.id,
      title: plan.title,
      start_date: plan.start_date,
      end_date: plan.end_date,
      countries: plan.countries.map(country => ({
        alpha3_code: country.alpha3_code,
        name: country.name,
        region: country.region,
        capital: country.capital,
        flag_url: country.flag_url,
      })),
      created_at: plan.created_at,
      updated_at: plan.updated_at,
    };
  }
}
