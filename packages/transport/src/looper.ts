type PromiseResolver<T> = (value: T | PromiseLike<T>) => void;

export class Looper<T> {
  private resolver: PromiseResolver<T> | undefined;

  set(resolver?: PromiseResolver<T>) {
    this.resolver = resolver;
  }

  run(res: T) {
    if (this.resolver) {
      this.resolver(res);
      this.resolver = undefined;
    }
  }
}
