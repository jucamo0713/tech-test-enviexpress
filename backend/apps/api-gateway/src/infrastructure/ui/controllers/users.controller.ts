import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Roles } from '../../decorators/roles.decorator';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { CreateOperatorRequest } from '../../dtos/users/operator.request';
import {
  GatewayCreateOperatorCommand,
  GatewayListOperatorsQuery,
  GatewayRevokeOperatorAccessCommand,
} from '../../../domain/models/cqrs/gateway.messages';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users/operators')
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @Roles('admin')
  list(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.queryBus.execute(
      new GatewayListOperatorsQuery(
        this.normalizePage(page),
        this.normalizeLimit(limit),
      ),
    );
  }

  @Post()
  @Roles('admin')
  create(@Body() request: CreateOperatorRequest) {
    return this.commandBus.execute(new GatewayCreateOperatorCommand(request));
  }

  @Patch(':id/revoke')
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
