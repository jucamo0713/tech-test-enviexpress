import { Injectable, inject } from '@angular/core';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { APP_CONFIG } from '../../core/config';
import { AppError } from '../../core/errors';
import { AUTH_TOKEN_READER } from '../../core/http';
import { HttpRequestOptions } from './http-request-options';

@Injectable({ providedIn: 'root' })
export class HttpClient {
  private readonly config = inject(APP_CONFIG);
  private readonly readToken = inject(AUTH_TOKEN_READER);
  private readonly client: AxiosInstance = axios.create({
    baseURL: this.config.apiBaseUrl,
    timeout: this.config.requestTimeoutMs,
  });

  constructor() {
    this.client.interceptors.request.use((request) => {
      const token = this.readToken();

      if (token) {
        request.headers.Authorization = `Bearer ${token}`;
      }

      request.headers['x-request-id'] ??= createRequestId();

      return request;
    });
  }

  async get<TResponse>(
    uri: string,
    options?: HttpRequestOptions,
  ): Promise<TResponse> {
    return this.request<TResponse>({ ...options, method: 'GET', url: uri });
  }

  async post<TResponse, TBody = unknown>(
    uri: string,
    body?: TBody,
    options?: HttpRequestOptions,
  ): Promise<TResponse> {
    return this.request<TResponse>({
      ...options,
      data: body,
      method: 'POST',
      url: uri,
    });
  }

  async put<TResponse, TBody = unknown>(
    uri: string,
    body?: TBody,
    options?: HttpRequestOptions,
  ): Promise<TResponse> {
    return this.request<TResponse>({
      ...options,
      data: body,
      method: 'PUT',
      url: uri,
    });
  }

  async patch<TResponse, TBody = unknown>(
    uri: string,
    body?: TBody,
    options?: HttpRequestOptions,
  ): Promise<TResponse> {
    return this.request<TResponse>({
      ...options,
      data: body,
      method: 'PATCH',
      url: uri,
    });
  }

  async delete<TResponse>(
    uri: string,
    options?: HttpRequestOptions,
  ): Promise<TResponse> {
    return this.request<TResponse>({ ...options, method: 'DELETE', url: uri });
  }

  private async request<TResponse>(
    requestConfig: AxiosRequestConfig,
  ): Promise<TResponse> {
    try {
      const response = await this.client.request<TResponse>(requestConfig);
      return response.data;
    } catch (error) {
      throw mapAxiosError(error);
    }
  }
}

function createRequestId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

function mapAxiosError(error: unknown): AppError {
  if (!axios.isAxiosError(error)) {
    return {
      kind: 'unknown',
      message: error instanceof Error ? error.message : 'Unexpected error',
      details: error,
    };
  }

  const axiosError = error as AxiosError<{
    httpStatusCode?: number;
    message?: string | string[];
    path?: string;
    requestId?: string;
  }>;
  const responseData = axiosError.response?.data;
  const message = responseData?.message ?? axiosError.message;

  return {
    kind: axiosError.code === 'ECONNABORTED' ? 'timeout' : 'http',
    message: Array.isArray(message) ? message.join(', ') : message,
    statusCode: responseData?.httpStatusCode ?? axiosError.response?.status,
    requestId:
      responseData?.requestId ??
      readHeader(axiosError.response?.headers, 'x-request-id'),
    path: responseData?.path ?? axiosError.config?.url,
    details: responseData ?? error,
  };
}

function readHeader(
  headers: AxiosError['response'] extends { headers: infer THeaders }
    ? THeaders
    : unknown,
  key: string,
): string | undefined {
  if (!headers || typeof headers !== 'object') {
    return undefined;
  }

  const value = (headers as Record<string, unknown>)[key];
  return typeof value === 'string' ? value : undefined;
}

