import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  MessageEvent,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Sse,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import type { Request } from 'express';
import { Observable } from 'rxjs';
import {
  CreatePackageRequest,
  UpdatePackageRequest,
  UpdatePackageStatusRequest,
} from '../../dtos/packages/package.request';
import { Roles } from '../../decorators/roles.decorator';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import type { AuthenticatedUser } from '../../guards/authenticated-user';
import {
  GatewayCreatePackageCommand,
  GatewayDeletePackageCommand,
  GatewayGetPackageQuery,
  GatewayGetPublicPackageStatusQuery,
  GatewayListClientPackagesQuery,
  GatewayListPackagesQuery,
  GatewayTrackPackageStatusByIdQuery,
  GatewayTrackPackageStatusQuery,
  GatewayUpdatePackageCommand,
  GatewayUpdatePackageStatusCommand,
} from '../../../domain/models/cqrs/gateway.messages';

type AuthenticatedRequest = Request & { user: AuthenticatedUser };
const SSE_HEARTBEAT_INTERVAL_MS = 15_000;
type PackageStatusPayload = {
  history?: Array<{
    status: string;
    comment?: string;
    changedAt: string;
    changedBy?: string;
  }>;
  [key: string]: unknown;
};

@Controller('packages')
export class PackagesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'operator')
  list(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.queryBus.execute(
      new GatewayListPackagesQuery(
        this.normalizePage(page),
        this.normalizeLimit(limit),
        status,
        startDate,
        endDate,
      ),
    );
  }

  @Get('my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client')
  listMine(
    @Req() req: AuthenticatedRequest,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    if (!req.user.clientId) {
      throw new BadRequestException('Authenticated user has no clientId');
    }

    return this.queryBus.execute(
      new GatewayListClientPackagesQuery(
        req.user.clientId,
        this.normalizePage(page),
        this.normalizeLimit(limit),
        status,
        startDate,
        endDate,
      ),
    );
  }

  @Get('track')
  async publicStatus(
    @Query('trackingCode') trackingCode?: string,
    @Query('email') email?: string,
  ) {
    if (!trackingCode || !email) {
      throw new BadRequestException('trackingCode and email are required');
    }

    const packageRecord = await this.queryBus.execute(
      new GatewayGetPublicPackageStatusQuery(trackingCode, email),
    );

    return this.toPublicPackageStatus(packageRecord);
  }

  @Sse('track/status-stream')
  async publicStatusStream(
    @Query('trackingCode') trackingCode?: string,
    @Query('email') email?: string,
  ): Promise<Observable<MessageEvent>> {
    if (!trackingCode || !email) {
      throw new BadRequestException('trackingCode and email are required');
    }

    const stream = await this.queryBus.execute(
      new GatewayTrackPackageStatusQuery(trackingCode, email),
    );

    return this.createPackageStatusSse(stream as Observable<unknown>, false);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'operator', 'client')
  get(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.queryBus.execute(
      new GatewayGetPackageQuery(id, this.clientIdForScopedAccess(req.user)),
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'operator')
  create(@Body() request: CreatePackageRequest, @Req() req: AuthenticatedRequest) {
    return this.commandBus.execute(
      new GatewayCreatePackageCommand(request, req.user.sub),
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(
    @Param('id') id: string,
    @Body() request: UpdatePackageRequest,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.commandBus.execute(
      new GatewayUpdatePackageCommand(id, request, req.user.sub),
    );
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'operator')
  updateStatus(
    @Param('id') id: string,
    @Body() request: UpdatePackageStatusRequest,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.commandBus.execute(
      new GatewayUpdatePackageStatusCommand(
        id,
        request.status,
        req.user.sub,
        request.comment,
      ),
    );
  }

  @Sse(':id/status-stream')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'operator', 'client')
  async statusStream(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<Observable<MessageEvent>> {
    const stream = await this.queryBus.execute(
      new GatewayTrackPackageStatusByIdQuery(
        id,
        this.clientIdForScopedAccess(req.user),
      ),
    );

    return this.createPackageStatusSse(stream as Observable<unknown>, true);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  delete(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.commandBus.execute(
      new GatewayDeletePackageCommand(id, req.user.sub),
    );
  }

  private createPackageStatusSse(
    stream: Observable<unknown>,
    exposeActors: boolean,
  ): Observable<MessageEvent> {
    return new Observable<MessageEvent>((subscriber) => {
      let heartbeatTimer: ReturnType<typeof setInterval> | undefined;
      const emitHeartbeat = () => {
        subscriber.next({
          type: 'heartbeat',
          data: { heartbeat: new Date().toISOString() },
        });
      };
      const startHeartbeat = () => {
        heartbeatTimer ??= setInterval(
          emitHeartbeat,
          SSE_HEARTBEAT_INTERVAL_MS,
        );
      };

      const grpcSubscription = stream.subscribe({
        next: (packageRecord) => {
          startHeartbeat();
          subscriber.next({
            type: 'package-status',
            data: {
              heartbeat: new Date().toISOString(),
              package: exposeActors
                ? packageRecord
                : this.toPublicPackageStatus(packageRecord),
            },
          });
        },
        error: (error) => subscriber.error(error),
        complete: () => subscriber.complete(),
      });

      return () => {
        if (heartbeatTimer) clearInterval(heartbeatTimer);
        grpcSubscription.unsubscribe();
      };
    });
  }

  private toPublicPackageStatus(packageRecord: unknown): unknown {
    if (!this.isPackageStatusPayload(packageRecord)) return packageRecord;

    return {
      ...packageRecord,
      history: packageRecord.history?.map(({ changedBy: _changedBy, ...history }) => history) ?? [],
    };
  }

  private isPackageStatusPayload(
    packageRecord: unknown,
  ): packageRecord is PackageStatusPayload {
    return typeof packageRecord === 'object' && packageRecord !== null;
  }

  private clientIdForScopedAccess(user: AuthenticatedUser): string | undefined {
    if (user.role !== 'client') return undefined;
    if (!user.clientId) {
      throw new BadRequestException('Authenticated user has no clientId');
    }

    return user.clientId;
  }

  private normalizePage(page?: string): number {
    return Math.max(Number(page || 1), 1);
  }

  private normalizeLimit(limit?: string): number {
    return Math.min(Math.max(Number(limit || 10), 1), 100);
  }
}
