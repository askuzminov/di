/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { DI, inject, injectFn, transient } from '../../src';
import { ErrorRun } from '../../src/errors';
import { A } from '../stores/a';
import { B } from '../stores/b';

describe('Errors', () => {
  test('inject undefined', () => {
    class V {
      // @ts-ignore
      x = inject();
    }
    try {
      new V();
    } catch (e) {
      expect(e).toEqual(Error('Class not defined'));
    }
  });

  test('injectFn undefined', () => {
    class V {
      // @ts-ignore
      x = injectFn();
    }
    try {
      new V();
    } catch (e) {
      expect(e).toEqual(Error('Class not defined'));
    }
  });

  test('No DI', () => {
    class V {
      a = inject(A);
    }

    try {
      const di = new DI();

      const v = di.getFn(V);

      v().a.count;
    } catch (e) {
      expect(e).toEqual(Error('DI not inited'));
    }
  });

  test('No DI', () => {
    class V {
      a = inject(A);
    }

    try {
      const di = new DI();

      di.init();

      const v = di.get(V);

      v.a.count;
    } catch (e) {
      expect(e).toEqual(Error('Module "V" not found'));
    }
  });

  test('No DI', () => {
    class V {
      a = transient(null as any);
    }

    try {
      const di = new DI();

      di.set(V).init();
    } catch (e) {
      expect(e).toEqual(Error('Module "V" fail with error'));
    }
  });

  test('No DI', () => {
    try {
      const di = new DI();

      di.set('z', A as any);
    } catch (e) {
      expect(e).toEqual(Error('Not found module "z"'));
    }
  });

  test('No DI', () => {
    try {
      const di = new DI();

      di.set(null as any);
    } catch (e) {
      expect(e).toEqual(Error('Not found module "null"'));
    }
  });

  test('No DI', () => {
    class Z {
      constructor(public b = inject(B)) {
        throw Error('a');
      }
    }

    try {
      const di = new DI();

      di.set(Z).init();
    } catch (e) {
      expect(e).toEqual(Error('Module "Z" fail with error'));
      expect((e as ErrorRun).error).toEqual(Error('a'));
    }
  });

  test('No DI', () => {
    class Z {
      constructor(public b = inject(A)) {
        b.count;
      }
    }

    try {
      const di = new DI({
        a: A,
        z: Z,
      }).init();

      di.get('v' as any);
    } catch (e) {
      expect(e).toEqual(Error('Module "v" not found'));
    }
  });

  test('No DI', () => {
    class Z {
      constructor(public b = inject(A)) {
        b.count;
      }
    }

    try {
      const di = new DI({
        a: A,
        z: Z,
      }).init();

      di.getFn('v' as any);
    } catch (e) {
      expect(e).toEqual(Error('Module "v" not found'));
    }
  });

  test('No DI', () => {
    class Z {
      constructor(public b = inject(A)) {
        b.count;
      }
    }

    try {
      const di = new DI({
        a: A,
        z: Z,
      }).init();

      di.getDirect('v' as any);
    } catch (e) {
      expect(e).toEqual(Error('Module "v" not found'));
    }
  });

  test('No DI', () => {
    class Z {
      constructor(public b = inject(A)) {
        b.count;
      }
    }

    const di = new DI({
      a: A,
      z: Z,
    }).init();

    di.rebuild('v' as any);
    di.rebuild(B);
  });
});
