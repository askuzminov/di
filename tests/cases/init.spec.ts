import { inject, injectFn } from '../../src';
import { A } from '../stores/a';
import { B } from '../stores/b';

class C {
  constructor(public a = inject(A), public b = inject(B)) {
    this.a.add();
    b.pos = 3;
  }
}

class D {
  constructor(public a = inject(A)) {
    this.a.add();
  }
}

class DFn {
  constructor(public a = injectFn(A)) {
    this.a().add();
  }
}

describe('Init', () => {
  test('No DI', () => {
    try {
      new C(new A());
    } catch (e) {
      expect(e).toStrictEqual(new Error('DI not inited'));
    }
  });

  test('Empty', () => {
    try {
      new D();
    } catch (e) {
      expect(e).toStrictEqual(new Error('DI not inited'));
    }
  });

  test('Empty', () => {
    try {
      new DFn();
    } catch (e) {
      expect(e).toStrictEqual(new Error('DI not inited'));
    }
  });

  test('All deps', () => {
    const d = new D(new A());

    expect(d.a.count).toBe(2);
  });
});
