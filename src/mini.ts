/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { AfterStore, Constructor, Store } from './types';

const stores = new Map<Constructor, Store<Constructor>>();

// Proxy
export function di<K extends Constructor>(original: K): AfterStore<K> {
  return new Proxy(({} as unknown) as AfterStore<K>, {
    get(_target, name) {
      let cl = stores.get(original);

      if (!cl) {
        cl = { init: original, ready: false, deps: [], real: undefined };
        stores.set(original, cl);
      }

      if (!cl.real) {
        cl.real = new original();
        cl.ready = true;
      }

      return cl.real[name];
    },
    set(_target, prop, val) {
      const cl = stores.get(original);

      if (!cl || !cl.real) {
        return false;
      }

      cl.real[prop] = val;
      return true;
    },
  });
}

export function diSet<K extends Constructor, Z extends K>(original: K, alter?: Z) {
  stores.set(original, { init: alter ?? original, ready: false, deps: [] });
}

export function diRun<T extends Constructor = Constructor>(fn: (store: T) => void) {
  stores.forEach(cl => {
    if (cl.real != null) {
      fn(cl.real);
    }
  });
}

export async function diRunAsync<T extends Constructor = Constructor>(fn: (store: T) => void | Promise<void>) {
  const each: T[] = [];

  stores.forEach(cl => {
    if (cl.real != null) {
      each.push(cl.real);
    }
  });

  for (const real of each) {
    await fn(real);
  }
}
