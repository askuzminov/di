import { DI, inject } from '../../src';
import { A } from '../stores/a';
import { B } from '../stores/b';

class C {
  a = inject(A);
  b = inject(B);
  d = inject(D);

  get result() {
    return this.a.count + this.b.pos * this.d.users;
  }
}

class D {
  a = inject(A);
  c = inject(C);
  users = 10;

  add(count: number) {
    return (this.users += count);
  }
}

describe('Cycles', () => {
  test('Base', () => {
    const di = new DI();

    di.set(A).set(B).set(C).set(D).init();

    const a = di.get(A);
    const b = di.get(B);
    const c = di.get(C);
    const d = di.get(D);

    expect(a.add()).toEqual(2);
    expect(b.action()).toEqual(2);
    expect(b.someAdd()).toEqual(3);
    expect((b.pos = 1)).toEqual(1);
    expect(c.result).toEqual(13);
    expect(d.add(5)).toEqual(15);
    expect(c.result).toEqual(18);
  });

  test('Base with constructor', () => {
    const di = new DI();

    class DD extends D {
      constructor() {
        super();
        this.a.count = 10;
      }
    }

    di.set(A).set(B).set(C).set(D, DD).init();

    const a = di.get(A);
    const b = di.get(B);
    const c = di.get(C);
    const d = di.get(D);

    expect(a.add()).toEqual(11);
    expect(b.action()).toEqual(11);
    expect(b.someAdd()).toEqual(12);
    expect((b.pos = 1)).toEqual(1);
    expect(c.result).toEqual(22);
    expect(d.add(5)).toEqual(15);
    expect(c.result).toEqual(27);
  });

  test('Base', () => {
    const di = new DI();

    class DD {
      num = 0;
      constructor({ c = inject(A) } = {}) {
        this.num = c.count;
      }
    }

    di.set(DD).set(A).set(B).set(C).set(D).init();

    const dd = di.get(DD);

    expect(dd.num).toBe(1);
  });

  test('Exception', () => {
    const di = new DI();

    class DD extends D {
      constructor() {
        super();
        console.log(this.c.result);
      }
    }

    try {
      di.set(A).set(B).set(C).set(D, DD).init();
    } catch (e) {
      expect(e).toEqual(Error('Error deps:\nModule "DD" not found "D" or cycles with it'));
    }
  });

  test('Exception resolve', done => {
    const di = new DI();

    class DD extends D {
      constructor() {
        super();
        setTimeout(() => {
          expect(this.c.result).toBe(1);
          done();
        });
      }
    }

    di.set(A).set(B).set(C).set(D, DD).init();
  });
});
