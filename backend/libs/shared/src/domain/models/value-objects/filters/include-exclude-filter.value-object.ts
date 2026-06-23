export type IncludeExcludeFilterParams<T> = {
  include?: T[];
  exclude?: T[];
};

export class IncludeExcludeFilter<T> {
  private readonly include?: T[];
  private readonly exclude?: T[];

  constructor(params?: IncludeExcludeFilterParams<T>) {
    this.include = params?.include?.length ? params.include : undefined;
    this.exclude = params?.exclude?.length ? params.exclude : undefined;
  }

  static fromInclude<T>(include?: T[]): IncludeExcludeFilter<T> {
    return new IncludeExcludeFilter<T>({ include });
  }

  static fromExclude<T>(exclude?: T[]): IncludeExcludeFilter<T> {
    return new IncludeExcludeFilter<T>({ exclude });
  }

  getInclude(): T[] | undefined {
    return this.include;
  }

  getExclude(): T[] | undefined {
    return this.exclude;
  }

  isEmpty(): boolean {
    return !this.include && !this.exclude;
  }
}
