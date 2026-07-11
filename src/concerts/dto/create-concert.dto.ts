import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateConcertDto {
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty()
  @MaxLength(2000)
  description!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100_000)
  totalSeats!: number;
}
