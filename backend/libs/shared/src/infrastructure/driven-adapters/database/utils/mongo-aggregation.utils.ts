import { InternalServerErrorException } from '@nestjs/common';
import type { QueryFilter } from 'mongoose';
import { Expression, PipelineStage } from 'mongoose';
import {
  LimitValueObject,
  PageValueObject,
  SharedErrorMessagesConstants,
  SortableKey,
  SorterProperty,
} from '@shared/domain';
import {
  PaginatedAggregationResult,
  PaginatedAggregationResultItem,
} from '@shared/infrastructure/driven-adapters/database/types/paginated-aggregation-result.type';

export function buildPaginationPipeline<T>(
  page?: PageValueObject,
  limit?: LimitValueObject,
  params?: {
    filter?: QueryFilter<T>;
    sort?: Record<string, 1 | -1 | Expression.Meta>;
    preMatch?: PipelineStage[];
    postMatch?: PipelineStage.FacetPipelineStage[];
  },
): PipelineStage[] {
  const pipeline: PipelineStage[] = [];

  if (params?.preMatch) {
    pipeline.push(...params.preMatch);
  }

  if (params?.filter) {
    pipeline.push({ $match: params.filter });
  }

  const pipelineMain: PipelineStage.FacetPipelineStage[] = [];

  if (params?.postMatch) {
    pipelineMain.push(...params.postMatch);
  }

  if (params?.sort) {
    pipelineMain.push({ $sort: params.sort });
  }

  if (page && limit) {
    const skip = (page.toNumber() - 1) * limit.toNumber();
    pipelineMain.push({ $skip: skip });
    pipelineMain.push({ $limit: limit.toNumber() });
  }

  const pipelineCount: PipelineStage.FacetPipelineStage[] = [
    { $count: 'total' },
  ];

  pipeline.push(
    { $facet: { total: pipelineCount, data: pipelineMain } },
    {
      $unwind: {
        path: '$total',
        preserveNullAndEmptyArrays: true,
      },
    },
  );

  return pipeline;
}

export function buildSortStage<T extends SortableKey>(
  sorterProperties: Array<SorterProperty<T>>,
): Record<string, 1 | -1> {
  const sortStage: Record<string, 1 | -1> = {};

  sorterProperties.forEach((sorterProperty) => {
    sortStage[sorterProperty.key.toString()] =
      sorterProperty.value.toSortNumber();
  });

  return sortStage;
}

export function getPaginatedAggregationData<T>(
  result: PaginatedAggregationResult<T> | undefined,
): {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} {
  const aggregation: PaginatedAggregationResultItem<T> | undefined =
    result?.[0];
  const total = aggregation?.total?.total ?? 0;
  const page = 1;
  const limit = total;
  return {
    data: aggregation?.data ?? [],
    total,
    page,
    limit,
    totalPages: 1,
  };
}

type DateRangeBoth<T> = {
  startDate: Date;
  endDate: Date;
  startField: keyof T | string;
  endField: keyof T | string;
};

type DateRangeStartOnly<T> = {
  startDate: Date;
  endDate?: undefined;
  startField?: undefined;
  endField: keyof T | string;
};

type DateRangeEndOnly<T> = {
  endDate: Date;
  startDate?: undefined;
  startField: keyof T | string;
  endField?: undefined;
};

type DateRangeNone<T> = {
  startDate?: Date;
  endDate?: Date;
  startField?: keyof T | string;
  endField?: keyof T | string;
};

type DateRangeParams<T> =
  | DateRangeBoth<T>
  | DateRangeStartOnly<T>
  | DateRangeEndOnly<T>
  | DateRangeNone<T>;

export function buildDateRangeFilter<T>(
  params: DateRangeParams<T>,
): QueryFilter<T> {
  const { startDate, endDate, startField, endField } = params;
  if (startDate && !endField) {
    throw new InternalServerErrorException(
      SharedErrorMessagesConstants.UNEXPECTED_DATE_RANGE_FILTER_CONFIGURATION,
    );
  }

  if (endDate && !startField) {
    throw new InternalServerErrorException(
      SharedErrorMessagesConstants.UNEXPECTED_DATE_RANGE_FILTER_CONFIGURATION,
    );
  }
  if (startDate && endDate) {
    if (startField === endField) {
      return {
        [startField as string]: { $gte: startDate, $lte: endDate },
      };
    }

    return {
      [startField as string]: { $lte: endDate },
      [endField as string]: { $gte: startDate },
    };
  }

  if (startDate) {
    return { [endField as string]: { $gte: startDate } };
  }

  if (endDate) {
    return { [startField as string]: { $lte: endDate } };
  }

  return {};
}

export const MongoAggregationUtils = {
  buildPaginationPipeline,
  getPaginatedAggregationData,
  buildDateRangeFilter,
  buildSortStage,
} as const;
