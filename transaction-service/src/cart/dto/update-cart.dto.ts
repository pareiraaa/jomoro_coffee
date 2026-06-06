import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class UpdateCartDto {
  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  quantity!: number;
}