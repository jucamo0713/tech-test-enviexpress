import { AsyncLocalStorage } from 'node:async_hooks';

export interface AsyncRequestContextObject {
  requestId: string;
}

const storage = new AsyncLocalStorage<AsyncRequestContextObject>();

function setData(
  data: AsyncRequestContextObject,
  context: (...args: unknown[]) => unknown,
): void {
  storage.run(data, context);
}

function setDataForCurrentContext<T extends keyof AsyncRequestContextObject>(
  key: T,
  value: AsyncRequestContextObject[T],
): void {
  const currentContext = storage.getStore();
  if (!currentContext) {
    throw new Error('No context set. Use setData to set the context first.');
  }
  currentContext[key] = value;
  storage.enterWith(currentContext);
}

function getData(): AsyncRequestContextObject | undefined {
  return storage.getStore();
}

function get<T extends keyof AsyncRequestContextObject>(
  key: T,
): AsyncRequestContextObject[T] | undefined {
  return storage.getStore()?.[key];
}

export const AsyncRequestContext = {
  setData,
  setDataForCurrentContext,
  getData,
  get,
} as const;
