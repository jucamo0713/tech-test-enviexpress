import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
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
  @Roles('admin', 'operator')
  list() {
    return this.queryBus.execute(new GatewayListClientsQuery());
  }

  @Get(':id')
  @Roles('admin', 'operator')
  get(@Param('id') id: string) {
    return this.queryBus.execute(new GatewayGetClientQuery(id));
  }

  @Post()
  @Roles('admin', 'operator')
  create(@Body() request: CreateClientRequest, @Req() req: AuthenticatedRequest) {
    return this.commandBus.execute(
      new GatewayCreateClientCommand(request, req.user.sub),
    );
  }

  @Patch(':id')
  @Roles('admin', 'operator')
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
}
