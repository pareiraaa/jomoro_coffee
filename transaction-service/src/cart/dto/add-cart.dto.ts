import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class AddCartDto {
  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  product_id!: number;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  quantity!: number;
}