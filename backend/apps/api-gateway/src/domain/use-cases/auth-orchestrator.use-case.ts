import { firstValueFrom } from 'rxjs';
import { AuthProto } from 'app/shared';

export class AuthOrchestratorUseCase {
  constructor(private readonly authService: AuthProto.AuthServiceClient) {}

  login(email: string, password: string) {
    return firstValueFrom(this.authService.login({ email, password }));
  }

  refresh(refreshToken: string) {
    return firstValueFrom(this.authService.refresh({ refreshToken }));
  }

  registerClient(trackingCode: string, email: string, password: string) {
    return firstValueFrom(
      this.authService.registerClient({ trackingCode, email, password }),
    );
  }
}
