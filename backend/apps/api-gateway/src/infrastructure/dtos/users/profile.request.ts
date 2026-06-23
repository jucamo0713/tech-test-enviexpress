import { IsString, MinLength } from 'class-validator';

export class UpdateProfileRequest {
  @IsString()
  @MinLength(2)
  name!: string;
}

export class ChangePasswordRequest {
  @IsString()
  @MinLength(8)
  currentPassword!: string;

  @IsString()
  @MinLength(8)
  newPassword!: string;
}
