import { Controller } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Observable } from 'rxjs';
import { PackageStatusProto, RedisPubSubClient } from 'app/shared';
import {
  GetPackageStatusQuery,
  TrackPackageStatusQuery,
} from '../../../domain/models/cqrs/queries/get-package-status.query';

@Controller()
@PackageStatusProto.PackageStatusServiceControllerMethods()
export class PackageStatusGrpcController
  implements PackageStatusProto.PackageStatusServiceController
{
  constructor(
    private readonly queryBus: QueryBus,
    private readonly redisPubSub: RedisPubSubClient,
  ) {}

  health(
    _request: PackageStatusProto.HealthRequest,
  ): PackageStatusProto.HealthResponse {
    return { status: 'ok' };
  }

  getPackageStatus(
    request: PackageStatusProto.GetPackageStatusRequest,
  ): Promise<PackageStatusProto.PackageStatusResponse> {
    return this.queryBus.execute(new GetPackageStatusQuery(request.id));
  }

  trackPackageStatus(
    request: PackageStatusProto.TrackPackageStatusRequest,
  ): Observable<PackageStatusProto.PackageStatusResponse> {
    return new Observable<PackageStatusProto.PackageStatusResponse>((subscriber) => {
      let packageId: string | undefined;
      let unsubscribe: (() => Promise<void>) | undefined;

      this.queryBus
        .execute<PackageStatusProto.PackageStatusResponse>(
          new TrackPackageStatusQuery(request.trackingCode, request.email),
        )
        .then(async (status) => {
          packageId = status.id;
          subscriber.next(status);
          unsubscribe = await this.redisPubSub.subscribe(
            'package.status.changed',
            async (event) => {
              if (event.payload['packageId'] !== packageId || !packageId) return;
              subscriber.next({
                id: String(event.payload['packageId']),
                trackingCode: String(event.payload['trackingCode']),
                status: String(event.payload['status']),
                history: Array.isArray(event.payload['history'])
                  ? event.payload['history'] as PackageStatusProto.PackageStatusHistoryResponse[]
                  : [],
                updatedAt: String(event.payload['updatedAt']),
                clientId: String(event.payload['clientId']),
              });
            },
          );
        })
        .catch((error) => subscriber.error(error));

      return () => {
        void unsubscribe?.();
      };
    });
  }
}
