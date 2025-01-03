import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class PaginationDto {
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  limit: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  page: number;
}
