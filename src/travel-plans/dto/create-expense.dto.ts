import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateExpenseDto {
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @Length(3, 255, { message: 'La descripción debe tener entre 3 y 255 caracteres' })
  description: string;

  @IsNotEmpty({ message: 'El monto es obligatorio' })
  @IsString({ message: 'El monto debe ser una cadena de texto' })
  amount: string;

  @IsNotEmpty({ message: 'La categoría es obligatoria' })
  @IsString({ message: 'La categoría debe ser una cadena de texto' })
  category: string;

  @IsNotEmpty({ message: 'El ID del plan de viaje es obligatorio' })
  @IsString({ message: 'El ID del plan de viaje debe ser una cadena de texto' })
  travel_plan_id: string;
}
