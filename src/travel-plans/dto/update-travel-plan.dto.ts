import { IsOptional, IsString, Length, IsArray, IsISO8601, ArrayMinSize, ArrayMaxSize } from 'class-validator';

export class UpdateTravelPlanDto {
  @IsOptional()
  @IsString({ message: 'El título debe ser una cadena de texto' })
  @Length(3, 255, { message: 'El título debe tener entre 3 y 255 caracteres' })
  title?: string;

  @IsOptional()
  @IsISO8601({}, { message: 'La fecha de inicio debe estar en formato ISO 8601 (YYYY-MM-DD)' })
  start_date?: string;

  @IsOptional()
  @IsISO8601({}, { message: 'La fecha de fin debe estar en formato ISO 8601 (YYYY-MM-DD)' })
  end_date?: string;

  @IsOptional()
  @IsArray({ message: 'Los códigos de país deben ser un array' })
  @ArrayMinSize(1, { message: 'Debe especificar al menos un país' })
  @ArrayMaxSize(50, { message: 'No puede especificar más de 50 países' })
  @IsString({ each: true, message: 'Cada código de país debe ser una cadena de texto' })
  country_codes?: string[];
}
