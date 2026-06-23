import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import type { Request } from 'express';
import {
  CreateClientRequest,
  UpdateClientRequest,
} from '../../dtos/clients/client.request';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import type { AuthenticatedUser } from '../../guards/authenticated-user';
import {
  GatewayCreateClientCommand,
  GatewayDeleteClientCommand,
  GatewayGetClientRegistrationStatsQuery,
  GatewayGetClientByEmailQuery,
  GatewayGetClientQuery,
  GatewayListClientsQuery,
  GatewayUpdateClientCommand,
} from '../../../domain/models/cqrs/gateway.messages';

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('clients')
export class ClientsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @Roles('admin')
  list(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.queryBus.execute(
      new GatewayListClientsQuery(
        this.normalizePage(page),
        this.normalizeLimit(limit),
        true,
      ),
    );
  }

  @Get('registration-stats')
  @Roles('admin')
  registrationStats() {
    return this.queryBus.execute(new GatewayGetClientRegistrationStatsQuery());
  }

  @Get('by-email')
  @Roles('admin', 'operator')
  getByEmail(@Query('email') email: string) {
    return this.queryBus.execute(new GatewayGetClientByEmailQuery(email));
  }

  @Get(':id')
  @Roles('admin')
  get(@Param('id') id: string) {
    return this.queryBus.execute(new GatewayGetClientQuery(id));
  }

  @Post()
  @Roles('admin')
  create(@Body() request: CreateClientRequest, @Req() req: AuthenticatedRequest) {
    return this.commandBus.execute(
      new GatewayCreateClientCommand(request, req.user.sub),
    );
  }

  @Patch(':id')
  @Roles('admin')
  update(
    @Param('id') id: string,
    @Body() request: UpdateClientRequest,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.commandBus.execute(
      new GatewayUpdateClientCommand(id, request, req.user.sub),
    );
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles('admin')
  delete(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.commandBus.execute(
      new GatewayDeleteClientCommand(id, req.user.sub),
    );
  }

  private normalizePage(page?: string): number {
    return Math.max(Number(page || 1), 1);
  }

  private normalizeLimit(limit?: string): number {
    return Math.min(Math.max(Number(limit || 10), 1), 100);
  }
}
