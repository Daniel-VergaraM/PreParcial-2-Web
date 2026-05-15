import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

export interface RestCountryResponse {
  name: {
    common: string;
    official: string;
  };
  cca3: string;
  region: string;
  capital?: string[];
  population: number;
  flags: {
    png: string;
    svg: string;
  };
}

export interface CountryData {
  alpha3_code: string;
  name: string;
  region: string;
  capital: string;
  population: number;
  flag_url: string;
}

@Injectable()
export class RestCountriesProvider {
  private readonly logger = new Logger(RestCountriesProvider.name);
  private readonly baseUrl = 'https://restcountries.com/v3.1';

  constructor(private readonly httpService: HttpService) {}

  async fetchCountryByAlpha3Code(alpha3Code: string): Promise<CountryData | null> {
    const upperCode = alpha3Code.toUpperCase();
    
    try {
      this.logger.log(`Fetching country data for code: ${upperCode}`);
      
      // Usar el endpoint sin parámetros de fields para evitar problemas
      const url = `${this.baseUrl}/alpha/${upperCode}`;
      this.logger.debug(`Requesting URL: ${url}`);
      
      const response = await firstValueFrom(
        this.httpService.get<RestCountryResponse>(url),
      );

      this.logger.debug(`Response status: ${response.status}`);
      this.logger.debug(`Response data type: ${typeof response.data}`);
      this.logger.debug(`Response data isArray: ${Array.isArray(response.data)}`);

      if (!response.data) {
        this.logger.warn(`Empty response for code: ${upperCode}`);
        return null;
      }

      // La API puede devolver un objeto único o un array con un elemento
      let countryData: RestCountryResponse;
      
      if (Array.isArray(response.data)) {
        if (response.data.length === 0) {
          this.logger.warn(`Empty array response for code: ${upperCode}`);
          return null;
        }
        countryData = response.data[0];
      } else {
        countryData = response.data;
      }

      // Validar que tenemos los campos necesarios
      if (!countryData.cca3 || !countryData.name) {
        this.logger.error(`Invalid response structure for code ${upperCode}: ${JSON.stringify(countryData)}`);
        return null;
      }
      
      const result: CountryData = {
        alpha3_code: countryData.cca3.toUpperCase(),
        name: countryData.name.common || countryData.name.official || 'Unknown',
        region: countryData.region || 'Unknown',
        capital: countryData.capital?.[0] || 'Unknown',
        population: countryData.population || 0,
        flag_url: countryData.flags?.png || countryData.flags?.svg || '',
      };
      
      this.logger.log(`Successfully fetched country: ${result.name} (${result.alpha3_code})`);
      return result;
      
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 404) {
          this.logger.warn(`Country with code ${upperCode} not found in RestCountries API (404)`);
          return null;
        }
        this.logger.error(
          `Axios error for code ${upperCode}: ${error.message} (Status: ${error.response?.status})`,
          error.response?.data,
        );
      } else {
        this.logger.error(
          `Failed to fetch country data for code ${upperCode}: ${error.message}`,
          error.stack,
        );
      }
      return null;
    }
  }
}
