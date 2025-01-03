import {
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty()
  @IsString({ message: 'ONLY STRING' })
  @MinLength(5)
  @MaxLength(255)
  readonly name: string;

  @IsNotEmpty()
  @IsString({ message: 'ONLY STRING' })
  @MinLength(5)
  @MaxLength(255)
  readonly category: string;

  @IsNotEmpty()
  @IsNumber()
  readonly ownerId: number;
}
