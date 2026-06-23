import { firstValueFrom } from 'rxjs';
import { UsersProto } from 'app/shared';
import { CreateOperatorRequest } from '../../infrastructure/dtos/users/operator.request';
import {
  ChangePasswordRequest,
  UpdateProfileRequest,
} from '../../infrastructure/dtos/users/profile.request';

export class UsersOrchestratorUseCase {
  constructor(private readonly usersService: UsersProto.UsersServiceClient) {}

  async listOperators(page: number, limit: number) {
    const response = await firstValueFrom(
      this.usersService.listOperators({ page, limit }),
    );

    return {
      items: response.users.map((user) => this.toPublicUser(user)),
      page: response.page,
      limit: response.limit,
      total: response.total,
      totalPages: response.totalPages,
    };
  }

  async createOperator(request: CreateOperatorRequest) {
    const user = await firstValueFrom(
      this.usersService.createOperator(request),
    );
    return this.toPublicUser(user);
  }

  async revokeOperatorAccess(id: string) {
    const user = await firstValueFrom(
      this.usersService.revokeOperatorAccess({ id }),
    );
    return this.toPublicUser(user);
  }

  async getProfile(id: string) {
    const user = await firstValueFrom(this.usersService.getUserById({ id }));
    return this.toPublicUser(user);
  }

  async updateProfile(id: string, request: UpdateProfileRequest) {
    const user = await firstValueFrom(
      this.usersService.updateProfile({
        id,
        name: request.name,
      }),
    );
    return this.toPublicUser(user);
  }

  async changePassword(id: string, request: ChangePasswordRequest) {
    const user = await firstValueFrom(
      this.usersService.changePassword({
        id,
        currentPassword: request.currentPassword,
        newPassword: request.newPassword,
      }),
    );
    return this.toPublicUser(user);
  }

  private toPublicUser(user: UsersProto.UserResponse) {
    const { passwordHash: _passwordHash, ...publicUser } = user;
    return publicUser;
  }
}
