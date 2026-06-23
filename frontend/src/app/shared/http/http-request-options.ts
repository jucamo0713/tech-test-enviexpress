import { AxiosRequestConfig } from 'axios';

export type HttpRequestOptions = Pick<
  AxiosRequestConfig,
  'headers' | 'params' | 'responseType' | 'signal' | 'timeout'
>;

