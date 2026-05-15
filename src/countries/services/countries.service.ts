import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from '../entities/country.entity';
import { RestCountriesProvider, CountryData } from '../providers/rest-countries.provider';

@Injectable()
export class CountriesService {
  private readonly logger = new Logger(CountriesService.name);

  constructor(
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
    private readonly restCountriesProvider: RestCountriesProvider,
  ) {}

  /**
   * Busca un país por su código Alpha-3.
   * Primero busca en la base de datos local (caché).
   * Si no existe, consulta la API externa y lo guarda localmente.
   */
  async findOrCreateByAlpha3Code(alpha3Code: string): Promise<Country | null> {
    const normalizedCode = alpha3Code.toUpperCase();
    
    // Paso 1: Buscar en caché local
    this.logger.log(`Searching for country ${normalizedCode} in local cache`);
    const cachedCountry = await this.findByAlpha3Code(normalizedCode);
    
    if (cachedCountry) {
      this.logger.log(`Country ${normalizedCode} found in local cache`);
      return cachedCountry;
    }

    // Paso 2: Si no existe, consultar API externa
    this.logger.log(`Country ${normalizedCode} not found in cache. Fetching from external API...`);
    const countryData = await this.restCountriesProvider.fetchCountryByAlpha3Code(normalizedCode);
    
    if (!countryData) {
      this.logger.warn(`Country ${normalizedCode} not found in external API`);
      return null;
    }

    // Paso 3: Guardar en base de datos local (caché)
    this.logger.log(`Saving country ${normalizedCode} to local cache`);
    return this.saveCountry(countryData);
  }

  /**
   * Busca un país por código Alpha-3 en la base de datos local únicamente.
   */
  async findByAlpha3Code(alpha3Code: string): Promise<Country | null> {
    return this.countryRepository.findOne({
      where: { alpha3_code: alpha3Code.toUpperCase() },
    });
  }

  /**
   * Guarda un país en la base de datos local.
   */
  private async saveCountry(countryData: CountryData): Promise<Country> {
    const country = this.countryRepository.create(countryData);
    return this.countryRepository.save(country);
  }

  /**
   * Busca múltiples países por sus códigos Alpha-3.
   * Resuelve desde caché o API externa según corresponda.
   */
  async findOrCreateMultiple(alpha3Codes: string[]): Promise<Country[]> {
    this.logger.log(`Processing ${alpha3Codes.length} country codes: ${alpha3Codes.join(', ')}`);
    const countries: Country[] = [];
    const failedCodes: string[] = [];
    
    for (const code of alpha3Codes) {
      this.logger.debug(`Processing code: ${code}`);
      const country = await this.findOrCreateByAlpha3Code(code);
      if (country) {
        countries.push(country);
        this.logger.debug(`Successfully resolved: ${code} -> ${country.name}`);
      } else {
        failedCodes.push(code);
        this.logger.warn(`Failed to resolve country code: ${code}`);
      }
    }
    
    this.logger.log(`Successfully resolved ${countries.length}/${alpha3Codes.length} countries`);
    if (failedCodes.length > 0) {
      this.logger.warn(`Failed codes: ${failedCodes.join(', ')}`);
    }
    
    return countries;
  }

  /**
   * Obtiene todos los países almacenados localmente.
   */
  async findAll(): Promise<Country[]> {
    return this.countryRepository.find({
      order: { name: 'ASC' },
    });
  }
}
