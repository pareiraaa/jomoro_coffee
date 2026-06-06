import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsInt, Min, Max } from 'class-validator';

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  price!: number;

  @ApiProperty()
  @IsInt()
  @Min(0)
  @Max(999)
  stock!: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  image_url?: string;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  category_id!: number;
}