import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Roles } from '../../decorators/roles.decorator';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { GatewayGetPackageStatusStatsQuery } from '../../../domain/models/cqrs/gateway.messages';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('package-status-stats')
  @Roles('admin')
  packageStatusStats(
    @Query('period') period = 'day',
    @Query('date') referenceDate?: string,
  ) {
    return this.queryBus.execute(
      new GatewayGetPackageStatusStatsQuery(period, referenceDate),
    );
  }
}
