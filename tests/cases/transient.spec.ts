import { DI, inject, transient } from '../../src';
import { A } from '../stores/a';

describe('Transient', () => {
  test('No DI', () => {
    try {
      transient(A);
    } catch (e) {
      expect(e).toEqual(Error('DI not inited'));
    }
  });

  test('Local', () => {
    const di = new DI();

    di.set(A).init();

    const a = di.get(A);
    const aLocal = di.transient(A);
    const aLocalDirect = new A();

    a.add();

    expect(a.count).toBe(2);
    expect(aLocal.count).toBe(1);
    expect(aLocalDirect.count).toBe(1);

    aLocal.add();

    expect(a.count).toBe(2);
    expect(aLocal.count).toBe(2);
    expect(aLocalDirect.count).toBe(1);

    aLocalDirect.add();

    expect(a.count).toBe(2);
    expect(aLocal.count).toBe(2);
    expect(aLocalDirect.count).toBe(2);
  });

  test('Injected', () => {
    class Z {
      global = inject(A);
      local = transient(A);
    }

    class F extends Z {}

    const di = new DI({
      a: A,
      z: Z,
      f: F,
    }).init();

    const a = di.get('a');
    const z = di.get('z');
    const f = di.get('f');

    expect(a.count).toBe(1);
    expect(z.global.count).toBe(1);
    expect(f.global.count).toBe(1);
    expect(z.local.count).toBe(1);
    expect(f.local.count).toBe(1);

    a.add();

    expect(a.count).toBe(2);
    expect(z.global.count).toBe(2);
    expect(f.global.count).toBe(2);
    expect(z.local.count).toBe(1);
    expect(f.local.count).toBe(1);

    z.global.add();

    expect(a.count).toBe(3);
    expect(z.global.count).toBe(3);
    expect(f.global.count).toBe(3);
    expect(z.local.count).toBe(1);
    expect(f.local.count).toBe(1);

    z.local.add();

    expect(a.count).toBe(3);
    expect(z.global.count).toBe(3);
    expect(f.global.count).toBe(3);
    expect(z.local.count).toBe(2);
    expect(f.local.count).toBe(1);
  });
});
