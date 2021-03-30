import { DI, inject } from '../../src';
import { A } from '../stores/a';
import { B } from '../stores/b';

describe('Static', () => {
  class R {
    a = inject(A);

    run() {
      return this.a.count;
    }
  }

  test('DI', () => {
    const di = new DI({
      a: A,
      b: B,
      r: R,
    }).init();

    const a = di.get('a');
    const r = di.get('r');

    a.count = 500;

    expect(a.count).toBe(500);
    expect(r.run()).toBe(500);

    class Aplus extends A {
      count = 300;
    }

    di.set(A, Aplus).init();

    expect(a.count).toBe(300);
    expect(r.run()).toBe(300);

    class Aminus extends A {
      count = -300;
    }

    di.set('a', Aminus).init();

    expect(a.count).toBe(-300);
    expect(r.run()).toBe(-300);
  });
});
