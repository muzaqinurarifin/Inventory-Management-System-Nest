import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  // TODO: Add validation decorators for the properties
  @IsString()
  @IsNotEmpty({ message: 'Nama kategori wajib diisi' })
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}
