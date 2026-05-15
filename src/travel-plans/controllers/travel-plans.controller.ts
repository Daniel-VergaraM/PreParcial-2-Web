import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe, ValidationPipe, Patch } from '@nestjs/common';
import { TravelPlansService, TravelPlanResponse } from '../services/travel-plans.service';
import { CreateTravelPlanDto } from '../dto/create-travel-plan.dto';
import { UpdateTravelPlanDto } from '../dto/update-travel-plan.dto';

/**
 * Controlador de Planes de Viaje - Interfaz Pública
 * 
 * Expone endpoints REST para la gestión completa de planes de viaje.
 * Este es el único módulo con rutas accesibles vía HTTP.
 */
@Controller('travel-plans')
export class TravelPlansController {
  constructor(private readonly travelPlansService: TravelPlansService) { }

  /**
   * POST /travel-plans
   * Crea un nuevo plan de viaje.
   * 
   * Ejemplo de body:
   * {
   *   "title": "Viaje por Sudamérica",
   *   "start_date": "2024-06-01",
   *   "end_date": "2024-06-15",
   *   "country_codes": ["COL", "PER", "CHL"]
   * }
   */
  @Post()
  async create(
    @Body(ValidationPipe) createDto: CreateTravelPlanDto,
  ): Promise<TravelPlanResponse> {
    return this.travelPlansService.create(createDto);
  }

  /**
   * GET /travel-plans
   * Lista todos los planes de viaje registrados.
   * Incluye información enriquecida de los países.
   */
  @Get()
  async findAll(): Promise<TravelPlanResponse[]> {
    return this.travelPlansService.findAll();
  }

  /**
   * GET /travel-plans/:id
   * Consulta el detalle de un plan específico por su identificador.
   * Incluye información enriquecida de los países.
   */
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<TravelPlanResponse> {
    return this.travelPlansService.findOne(id);
  }

  /**
   * PATCH /travel-plans/:id
   * Actualiza un plan de viaje existente.
   */
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateDto: UpdateTravelPlanDto,
  ): Promise<TravelPlanResponse> {
    return this.travelPlansService.update(id, updateDto);
  }

  /**
   * DELETE /travel-plans/:id
   * Elimina un plan de viaje existente del sistema.
   */
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.travelPlansService.remove(id);
    return {
      message: `Plan de viaje con ID ${id} eliminado exitosamente`
    };
  }
}
