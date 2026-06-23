import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of, throwError } from 'rxjs';

type HttpRequestMock = {
  body?: unknown;
  headers: Record<string, string | string[] | undefined>;
  method: string;
  query?: Record<string, unknown>;
  url: string;
};

type HttpResponseMock = {
  json: jest.Mock;
  setHeader: jest.Mock;
  status: jest.Mock;
};

export const HttpMock = {
  request(overrides: Partial<HttpRequestMock> = {}): HttpRequestMock {
    return {
      headers: {},
      method: 'GET',
      query: {},
      url: '/api/test',
      ...overrides,
    };
  },

  response(): HttpResponseMock {
    const response = {
      json: jest.fn(),
      setHeader: jest.fn(),
      status: jest.fn(),
    };
    response.status.mockReturnValue(response);
    return response;
  },

  executionContext(
    params: {
      handler?: (...args: unknown[]) => unknown;
      request?: HttpRequestMock;
      response?: HttpResponseMock;
      type?: string;
    } = {},
  ): ExecutionContext {
    const handler = params.handler ?? function handler() {};
    const request = params.request ?? HttpMock.request();
    const response = params.response ?? HttpMock.response();
    const type = params.type ?? 'http';

    return {
      getArgByIndex: jest.fn(),
      getArgs: jest.fn(),
      getClass: jest.fn(() => class TestController {}),
      getHandler: jest.fn(() => handler),
      getType: jest.fn(() => type),
      switchToHttp: jest.fn(() => ({
        getNext: jest.fn(),
        getRequest: jest.fn(() => request),
        getResponse: jest.fn(() => response),
      })),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
    } as unknown as ExecutionContext;
  },

  callHandler(value: unknown): CallHandler {
    return {
      handle: jest.fn(() => of(value)),
    };
  },

  throwingCallHandler(error: unknown): CallHandler {
    return {
      handle: jest.fn(() => throwError(() => error)),
    };
  },
} as const;
