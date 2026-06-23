export type DatesOf<T> = Extract<
  {
    [K in keyof T]: T[K] extends Date ? K : never;
  }[keyof T],
  string
>;
