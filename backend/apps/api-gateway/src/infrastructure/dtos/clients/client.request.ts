import { IsBoolean, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateClientRequest {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  phone!: string;

  @IsString()
  @MinLength(5)
  address!: string;
}

export class UpdateClientRequest {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  @MinLength(5)
  address?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
