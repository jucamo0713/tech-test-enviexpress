import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import type { Request } from 'express';
import { Roles } from '../../decorators/roles.decorator';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import type { AuthenticatedUser } from '../../guards/authenticated-user';
import { CreateOperatorRequest } from '../../dtos/users/operator.request';
import {
  ChangePasswordRequest,
  UpdateProfileRequest,
} from '../../dtos/users/profile.request';
import {
  GatewayChangePasswordCommand,
  GatewayCreateOperatorCommand,
  GatewayGetProfileQuery,
  GatewayListOperatorsQuery,
  GatewayRevokeOperatorAccessCommand,
  GatewayUpdateProfileCommand,
} from '../../../domain/models/cqrs/gateway.messages';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('me')
  profile(@Req() req: Request & { user: AuthenticatedUser }) {
    return this.queryBus.execute(new GatewayGetProfileQuery(req.user.sub));
  }

  @Patch('me')
  updateProfile(
    @Body() request: UpdateProfileRequest,
    @Req() req: Request & { user: AuthenticatedUser },
  ) {
    return this.commandBus.execute(
      new GatewayUpdateProfileCommand(req.user.sub, request),
    );
  }

  @Patch('me/password')
  changePassword(
    @Body() request: ChangePasswordRequest,
    @Req() req: Request & { user: AuthenticatedUser },
  ) {
    return this.commandBus.execute(
      new GatewayChangePasswordCommand(req.user.sub, request),
    );
  }

  @Get('operators')
  @Roles('admin')
  list(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.queryBus.execute(
      new GatewayListOperatorsQuery(
        this.normalizePage(page),
        this.normalizeLimit(limit),
      ),
    );
  }

  @Post('operators')
  @Roles('admin')
  create(@Body() request: CreateOperatorRequest) {
    return this.commandBus.execute(new GatewayCreateOperatorCommand(request));
  }

  @Patch('operators/:id/revoke')
  @Roles('admin')
  revoke(@Param('id') id: string) {
    return this.commandBus.execute(new GatewayRevokeOperatorAccessCommand(id));
  }

  private normalizePage(page?: string): number {
    return Math.max(Number(page || 1), 1);
  }

  private normalizeLimit(limit?: string): number {
    return Math.min(Math.max(Number(limit || 10), 1), 100);
  }
}
