import { IsOptional, IsString, Length, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  @Length(14)
  cpf: string;

  @IsString()
  @IsOptional()
  @MinLength(6)
  password: string;
}
