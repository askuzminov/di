/* eslint-disable @typescript-eslint/no-explicit-any */

// export type newStore<T = unknown> = new () => T;
export type Constructor = new (...args: any) => any;
export type AfterStore<T extends Constructor> = T extends new (...args: any) => infer P ? P : never;

export interface Store<T extends Constructor> {
  init: T;
  real?: AfterStore<T>;
  ready: boolean;
  deps: T[];
}
