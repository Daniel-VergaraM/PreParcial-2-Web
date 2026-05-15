import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TravelPlan } from '../entities/travel-plan.entity';
import { CountriesService } from '../../countries/services/countries.service';
import { UsersService } from '../../users/services/users.service';
import { CreateTravelPlanDto } from '../dto/create-travel-plan.dto';
import { UpdateTravelPlanDto } from '../dto/update-travel-plan.dto';
import { CreateExpenseDto } from '../dto/create-expense.dto';
import { Expense } from '../entities/expense.entity';

export interface TravelPlanResponse {
  id: number;
  userId: number;
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
  expenses: Array<{
    description: string;
    amount: number;
    category: string;
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
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    private readonly countriesService: CountriesService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Crea un nuevo plan de viaje.
   * Valida que el usuario exista y que los países sean válidos.
   */
  async create(createDto: CreateTravelPlanDto): Promise<TravelPlanResponse> {
    const { userId, title, start_date, end_date, country_codes } = createDto;

    // Validar que el usuario exista en la base de datos
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    // Validar que la fecha de fin sea posterior a la de inicio
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (endDate < startDate) {
      throw new BadRequestException('La fecha de fin debe ser posterior a la fecha de inicio');
    }

    // Normalizar códigos de país (mayúsculas)
    const normalizedCodes = country_codes.map((code) => code.toUpperCase());

    // Validar y obtener países usando el servicio de países
    this.logger.log(`Validating countries for new travel plan: ${normalizedCodes.join(', ')}`);
    const countries = await this.countriesService.findOrCreateMultiple(normalizedCodes);

    // Verificar que todos los países fueron encontrados
    if (countries.length !== normalizedCodes.length) {
      const foundCodes = countries.map((c) => c.alpha3_code);
      const notFoundCodes = normalizedCodes.filter((code) => !foundCodes.includes(code));
      throw new BadRequestException(
        `Los siguientes códigos de país no fueron encontrados: ${notFoundCodes.join(', ')}`,
      );
    }

    // Crear el plan de viaje vinculado al usuario
    const travelPlan = this.travelPlanRepository.create({
      userId,
      title,
      start_date: startDate,
      end_date: endDate,
      countries,
    });

    const savedPlan = await this.travelPlanRepository.save(travelPlan);
    this.logger.log(
      `Travel plan created successfully with ID: ${savedPlan.id} for user ID: ${userId}`,
    );

    return this.mapToResponse(savedPlan);
  }

  /**
   * Agrega un gasto a un plan de viaje existente.
   * Valida que el plan de viaje exista y que el monto sea un número válido.
   */
  async createExpense(dto: CreateExpenseDto): Promise<TravelPlanResponse> {
    const { description, amount, category, travel_plan_id } = dto;

    const plan = await this.travelPlanRepository.findOne({
      where: { id: parseInt(travel_plan_id) },
    });

    if (!plan) {
      throw new NotFoundException(`Plan de viaje con ID ${travel_plan_id} no encontrado`);
    }

    if (amount === undefined || isNaN(parseFloat(amount))) {
      throw new BadRequestException('El monto debe ser un número válido');
    }

    if (parseFloat(amount) < 0) {
      throw new BadRequestException('El monto no puede ser negativo');
    }

    if (description.length < 3 || description.length > 255) {
      throw new BadRequestException('La descripción debe tener entre 3 y 255 caracteres');
    }

    const expense = this.expenseRepository.create({
      description,
      amount: parseFloat(amount),
      category,
      travelPlanId: plan.id,
    });
    const savedExpense = await this.expenseRepository.save(expense);
    plan.expenses.push(savedExpense);
    const savedPlan = await this.travelPlanRepository.save(plan);
    this.logger.log(`Expense added to travel plan ${travel_plan_id} successfully`);
    return this.mapToResponse(savedPlan);
  }

  /**
   * Obtiene todos los planes de viaje con información de países.
   */
  async findAll(): Promise<TravelPlanResponse[]> {
    const plans = await this.travelPlanRepository.find({
      order: { created_at: 'DESC' },
    });

    return plans.map((plan) => this.mapToResponse(plan));
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
      const normalizedCodes = updateDto.country_codes.map((code) => code.toUpperCase());

      this.logger.log(`Updating countries for travel plan ${id}: ${normalizedCodes.join(', ')}`);
      const countries = await this.countriesService.findOrCreateMultiple(normalizedCodes);

      if (countries.length !== normalizedCodes.length) {
        const foundCodes = countries.map((c) => c.alpha3_code);
        const notFoundCodes = normalizedCodes.filter((code) => !foundCodes.includes(code));
        throw new BadRequestException(
          `Los siguientes códigos de país no fueron encontrados: ${notFoundCodes.join(', ')}`,
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
      userId: plan.userId,
      title: plan.title,
      start_date: plan.start_date,
      end_date: plan.end_date,
      countries: plan.countries.map((country) => ({
        alpha3_code: country.alpha3_code,
        name: country.name,
        region: country.region,
        capital: country.capital,
        flag_url: country.flag_url,
      })),
      expenses: plan.expenses.map((expense) => ({
        description: expense.description,
        amount: expense.amount,
        category: expense.category,
      })),
      created_at: plan.created_at,
      updated_at: plan.updated_at,
    };
  }
}
