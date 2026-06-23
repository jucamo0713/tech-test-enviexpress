import { IsEmail, IsIn, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';
import type { PackageStatus } from '../../../domain/use-cases/packages-orchestrator.use-case';

export class CreatePackageRequest {
  @IsOptional()
  @IsString()
  clientId?: string;

  @IsEmail()
  clientEmail!: string;

  @ValidateIf((request: CreatePackageRequest) => !request.clientId)
  @IsString()
  @MinLength(2)
  clientName?: string;

  @ValidateIf((request: CreatePackageRequest) => !request.clientId)
  @IsString()
  clientPhone?: string;

  @ValidateIf((request: CreatePackageRequest) => !request.clientId)
  @IsString()
  @MinLength(5)
  clientAddress?: string;

  @IsString()
  @MinLength(3)
  description!: string;

  @IsString()
  @MinLength(5)
  destinationAddress!: string;
}

export class UpdatePackageRequest {
  @IsOptional()
  @IsString()
  @MinLength(3)
  description?: string;

  @IsOptional()
  @IsString()
  @MinLength(5)
  destinationAddress?: string;
}

export class UpdatePackageStatusRequest {
  @IsIn([
    'created',
    'received',
    'in_transit',
    'failed_delivery',
    'delivered',
    'returned',
    'cancelled',
  ])
  status!: PackageStatus;

  @IsOptional()
  @IsString()
  comment?: string;
}
