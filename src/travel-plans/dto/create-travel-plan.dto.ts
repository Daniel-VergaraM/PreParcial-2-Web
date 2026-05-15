import {
  IsNotEmpty,
  IsString,
  Length,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  IsISO8601,
  IsNumber,
} from 'class-validator';

export class CreateTravelPlanDto {
  @IsNotEmpty({ message: 'El ID del usuario es obligatorio' })
  @IsNumber(
    {
      allowNaN: false,
      allowInfinity: false,
      maxDecimalPlaces: 0,
    },
    {
      message: 'El ID del usuario debe ser un número',
    },
  )
  userId: number;
  @IsNotEmpty({ message: 'El título es obligatorio' })
  @IsString({ message: 'El título debe ser una cadena de texto' })
  @Length(3, 255, { message: 'El título debe tener entre 3 y 255 caracteres' })
  title: string;

  @IsNotEmpty({ message: 'La fecha de inicio es obligatoria' })
  @IsISO8601({}, { message: 'La fecha de inicio debe estar en formato ISO 8601 (YYYY-MM-DD)' })
  start_date: string;

  @IsNotEmpty({ message: 'La fecha de fin es obligatoria' })
  @IsISO8601({}, { message: 'La fecha de fin debe estar en formato ISO 8601 (YYYY-MM-DD)' })
  end_date: string;

  @IsNotEmpty({ message: 'Debe especificar al menos un país' })
  @IsArray({ message: 'Los códigos de país deben ser un array' })
  @ArrayMinSize(1, { message: 'Debe especificar al menos un país' })
  @ArrayMaxSize(50, { message: 'No puede especificar más de 50 países' })
  @IsString({ each: true, message: 'Cada código de país debe ser una cadena de texto' })
  country_codes: string[];
}
