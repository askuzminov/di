/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { ErrorCyclic, ErrorDiNotInited, ErrorNotDefined, ErrorRun } from './errors';
import { AfterStore, Constructor, Store } from './types';

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

let current: DI<Constructor> | undefined;

// Proxy
export function inject<K extends Constructor, Z extends K>(original?: K, alter?: Z): AfterStore<Z> {
  if (!original) {
    throw new ErrorNotDefined();
  }

  if (!current) {
    throw new ErrorDiNotInited();
  }

  const context = current;

  return new Proxy(({} as unknown) as AfterStore<Z>, {
    get(_target, name) {
      const cl = context.getDirect(original, alter);
      return cl[name];
    },
    set(_target, prop, val) {
      const cl = context.getDirect(original, alter);
      cl[prop] = val;
      return true;
    },
  });
}

// Classic
export function injectFn<K extends Constructor, Z extends K>(original?: K, alter?: Z): () => AfterStore<Z> {
  if (!original) {
    throw new ErrorNotDefined();
  }

  if (!current) {
    throw new ErrorDiNotInited();
  }

  const context = current;

  return () => context.getDirect(original, alter);
}

// transient
export function transient<K extends Constructor>(original?: K): AfterStore<K> {
  if (!original) {
    throw new ErrorNotDefined();
  }

  if (!current) {
    throw new ErrorDiNotInited();
  }

  return current.transient(original);
}

export class DI<T extends Constructor, List extends Record<string, T> = Record<string, T>> {
  private limit = 10;
  private stores = new Map<T, Store<T>>();
  private inited = false;
  private ready = false;
  private next = false;
  private errorsCycles: Record<string, [string, string]> = {};

  constructor(private list?: List) {
    if (list) {
      Object.keys(list).forEach(key => {
        this.set(list[key]);
      });
    }
  }

  set<Z extends T, K extends Z>(original: Z, alter?: K): this;
  set<Z extends keyof List, K extends List[Z]>(original: Z, alter: K): this;
  set<Z extends T | keyof List, K extends T>(original: Z, alter: K): this {
    this.setCurrent();
    const cl = this.getKey(original);

    if (!cl) {
      throw new Error(
        `Not found module "${isString(original) ? original : (original as T)?.name ?? String(original)}"`
      );
    }

    this.stores.set(cl, { init: alter ?? cl, ready: false, deps: [] });
    return this;
  }

  init() {
    this.setCurrent();
    this.inited = true;
    this.repeat();
    this.ready = true;
    return this;
  }

  run(fn: (store: AfterStore<T>) => void) {
    this.setCurrent();
    const list = this.stores;

    list.forEach(cl => {
      if (cl.real != null) {
        fn(cl.real);
      }
    });

    return this;
  }

  async runAsync(fn: (store: AfterStore<T>) => void | Promise<void>) {
    this.setCurrent();
    const list = this.stores;
    const each: AfterStore<T>[] = [];

    list.forEach(cl => {
      if (cl.real != null) {
        each.push(cl.real);
      }
    });

    for (const real of each) {
      await fn(real);
    }

    return this;
  }

  rebuild(store?: T | keyof List) {
    this.setCurrent();
    const list = this.stores;

    if (store != null) {
      const item = this.getKey(store);
      if (item) {
        const st = list.get(item);
        if (st) {
          st.real = new item();
        }
      }
    } else {
      list.forEach(clName => {
        clName.real = new clName.init();
      });
    }

    return this;
  }

  get<K extends T, Z extends K>(original: K, alter?: Z): AfterStore<K>;
  get<K extends keyof List, Z extends T>(original: K, alter?: Z): AfterStore<List[K]>;
  get<K extends T | keyof List, Z extends T>(original: K, alter?: Z) {
    this.setCurrent();
    const el = this.getKey(original);
    if (!el) {
      throw new Error(`Module "${isString(original) ? original : (original as T).name}" not found`);
    }
    return inject(el, alter);
  }

  getFn<K extends T, Z extends K>(original: K, alter?: Z): () => AfterStore<K>;
  getFn<K extends keyof List, Z extends T>(original: K, alter?: Z): () => AfterStore<List[K]>;
  getFn<K extends T | keyof List, Z extends T>(original: K, alter?: Z) {
    this.setCurrent();
    const el = this.getKey(original);
    if (!el) {
      throw new Error(`Module "${isString(original) ? original : (original as T).name}" not found`);
    }
    return injectFn(el, alter);
  }

  transient = <Z extends T>(cl: Z): AfterStore<Z> => {
    this.setCurrent();
    return new cl();
  };

  getDirect<K extends T | keyof List, Z extends T>(original: K, alter?: Z) {
    const key = this.getKey(original);

    if (!key) {
      throw new Error(`Module "${isString(original) ? original : (original as T).name}" not found`);
    }

    const store: T | undefined = alter ? new alter() : this.stores.get(key)?.real;

    if (!store) {
      if (!this.inited) {
        throw new ErrorDiNotInited();
      } else if (this.ready) {
        throw new Error(`Module "${isString(original) ? original : (original as T).name}" not found`);
      }
      throw new ErrorCyclic(isString(original) ? original : (original as T).name, key);
    }

    return store as AfterStore<Z>;
  }

  private getKey(type: keyof List | T): T | undefined {
    return isString(type) ? (this.list ? this.list[type] : undefined) : (type as T);
  }

  private setCurrent() {
    current = this as DI<Constructor>;
  }

  private repeat(limit = this.limit) {
    const list = this.stores;

    this.next = false;

    list.forEach(item => {
      if (item.ready) {
        return;
      }
      if (!this.checkReady(item.deps)) {
        this.next = true;
        return;
      }
      try {
        item.real = new item.init();
        item.ready = true;
      } catch (e) {
        this.catch(e, item);
      }
    });

    if (limit === 0) {
      this.showError();
    }

    if (this.next) {
      this.repeat(limit - 1);
    }
  }

  private catch(e: unknown, item: Store<T>) {
    if (e instanceof ErrorCyclic) {
      this.errorsCycles[`${item.init.name}:::${e.item}`] = [item.init.name, e.item];
      item.deps.push(e.element as T);
      this.next = true;
    } else {
      throw new ErrorRun(item.init.name, e);
    }
  }

  private showError(): never {
    let err = 'Error deps:';

    for (const i in this.errorsCycles) {
      const [n, m] = this.errorsCycles[i];
      err += `\nModule "${n}" not found "${m}" or cycles with it`;
    }

    throw Error(err);
  }

  private checkReady(sts: T[]) {
    const list = this.stores;

    for (const st of sts) {
      if (list.get(st)?.ready !== true) {
        return false;
      }
    }

    return true;
  }
}
