import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import type { PackageStatus } from '../../../domain/use-cases/packages-orchestrator.use-case';

export class CreatePackageRequest {
  @IsString()
  clientId!: string;

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
