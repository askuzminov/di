import { DI, inject } from '../../src';
import { A } from '../stores/a';
import { B } from '../stores/b';

describe('Simple', () => {
  test('Inject', () => {
    const di = new DI();

    di.set(A).set(B).init();

    const b = di.get(B);

    expect(b.action()).toEqual(1);
    expect(b.someAdd()).toEqual(2);
  });

  test('Inject inside', () => {
    const di = new DI();

    class Temp extends A {
      inMethod() {
        return inject(B).pos * 2;
      }
    }

    di.set(Temp).set(A, Temp).set(B).init();

    const a = di.get(A) as Temp;
    const t = di.get(Temp);
    const b = di.get(B);

    b.pos = 10;
    expect(a.inMethod()).toEqual(20);

    b.pos = 20;
    expect(t.inMethod()).toEqual(40);
  });

  test('Inject inside', () => {
    const di = new DI();

    class BB extends B {
      pos = 10;
    }

    class Temp extends A {
      constructor(public b = inject(B, BB)) {
        super();
      }
    }

    di.set(Temp).set(A).set(B).init();

    const t = di.get(Temp);

    expect(t.b.pos).toEqual(10);
  });
});
