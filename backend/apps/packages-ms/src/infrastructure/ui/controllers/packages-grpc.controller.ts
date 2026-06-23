import { Controller } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { PackagesProto } from 'app/shared';
import type { PackageStatus } from '../../../domain/state-machine/package-state-machine';
import {
  CreatePackageCommand,
  DeletePackageCommand,
  UpdatePackageCommand,
  UpdatePackageStatusCommand,
} from '../../../domain/models/cqrs/commands/package.commands';
import {
  GetPackageQuery,
  GetPackageStatusStatsQuery,
  GetPackageByTrackingCodeQuery,
  ListPackagesByClientQuery,
  ListPackagesQuery,
  ListOperatorHistoryQuery,
} from '../../../domain/models/cqrs/queries/package.queries';

@Controller()
@PackagesProto.PackagesServiceControllerMethods()
export class PackagesGrpcController
  implements PackagesProto.PackagesServiceController
{
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  health(_request: PackagesProto.HealthRequest): PackagesProto.HealthResponse {
    return { status: 'ok' };
  }

  async listPackages(
    _request: PackagesProto.ListPackagesRequest,
  ): Promise<PackagesProto.ListPackagesResponse> {
    return this.queryBus.execute(
      new ListPackagesQuery(
        this.normalizePage(_request.page),
        this.normalizeLimit(_request.limit),
        _request.status,
        _request.startDate,
        _request.endDate,
      ),
    ) as Promise<PackagesProto.ListPackagesResponse>;
  }

  async listPackagesByClient(
    request: PackagesProto.ListPackagesByClientRequest,
  ): Promise<PackagesProto.ListPackagesResponse> {
    return this.queryBus.execute(
      new ListPackagesByClientQuery(
        request.clientId,
        this.normalizePage(request.page),
        this.normalizeLimit(request.limit),
        request.status,
        request.startDate,
        request.endDate,
      ),
    ) as Promise<PackagesProto.ListPackagesResponse>;
  }

  getPackage(request: PackagesProto.GetPackageRequest) {
    return this.queryBus.execute(new GetPackageQuery(request.id));
  }

  getPackageByTrackingCode(request: PackagesProto.GetPackageByTrackingCodeRequest) {
    return this.queryBus.execute(
      new GetPackageByTrackingCodeQuery(request.trackingCode),
    );
  }

  createPackage(request: PackagesProto.CreatePackageRequest) {
    return this.commandBus.execute(new CreatePackageCommand(request));
  }

  updatePackage(request: PackagesProto.UpdatePackageRequest) {
    const { id, ...input } = request;
    return this.commandBus.execute(new UpdatePackageCommand(id, input));
  }

  updatePackageStatus(request: PackagesProto.UpdatePackageStatusRequest) {
    return this.commandBus.execute(
      new UpdatePackageStatusCommand({
        ...request,
        status: request.status as PackageStatus,
      }),
    );
  }

  deletePackage(request: PackagesProto.DeletePackageRequest) {
    return this.commandBus.execute(new DeletePackageCommand(request.id));
  }

  getStatusStats(
    request: PackagesProto.PackageStatusStatsRequest,
  ): Promise<PackagesProto.PackageStatusStatsResponse> {
    return this.queryBus.execute(
      new GetPackageStatusStatsQuery(request.startDate, request.endDate),
    ) as Promise<PackagesProto.PackageStatusStatsResponse>;
  }

  async listOperatorHistory(
    request: PackagesProto.ListOperatorHistoryRequest,
  ): Promise<PackagesProto.ListOperatorHistoryResponse> {
    return this.queryBus.execute(
      new ListOperatorHistoryQuery(
        request.operatorId,
        this.normalizePage(request.page),
        this.normalizeLimit(request.limit),
      ),
    ) as Promise<PackagesProto.ListOperatorHistoryResponse>;
  }

  private normalizePage(page?: number): number {
    return Math.max(Number(page || 1), 1);
  }

  private normalizeLimit(limit?: number): number {
    return Math.min(Math.max(Number(limit || 10), 1), 100);
  }
}
