export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  clientId?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  name: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
