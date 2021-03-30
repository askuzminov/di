import { DI, inject } from '../../src';
import { MyStore } from '../store';
import { A } from '../stores/a';

class AMy extends A implements A, MyStore {
  clearStore() {}
  initStore() {}
}

class AFake implements AMy {
  count = 100;
  getter = 100;
  add() {
    return (this.count = 10);
  }
  clearStore() {}
  initStore() {}
}

class Test extends MyStore {
  constructor(private a = inject(AMy)) {
    super();
    this.a.add();
  }
  someMethod() {
    return this.a.count;
  }
}

class TestNew extends Test {
  someMethod() {
    return 999;
  }
}

class Obj extends MyStore {
  t: Test;
  default = 10;
  constructor({ a = inject(AMy), t = inject(Test) } = {}) {
    super();
    this.default += a.count;
    this.t = t;
  }
}

describe('Constructor', () => {
  test('Classic', () => {
    const di = new DI<typeof MyStore>();

    [AMy, Test, TestNew].forEach(i => di.set(i));

    di.init();

    const test = new Test();
    expect(test.someMethod()).toBe(4); // 1 default + DI Test and TestNew + new Test
  });

  test('Classic Raw', () => {
    const testAFake = new Test(new AFake());
    const testNew = new TestNew(new AFake());
    expect(testAFake.someMethod()).toBe(10);
    expect(testNew.someMethod()).toBe(999);
  });

  test('Object', () => {
    const di = new DI<typeof MyStore>();

    di.set(AMy);
    di.set(Test, TestNew);
    di.set(Obj);

    di.init();

    const obj = di.get(Obj);
    expect(obj.t.someMethod()).toBe(999);
    expect(obj.default).toBe(12); // 10 + 1 default + DI Test
  });

  test('Object raw', () => {
    const di = new DI<typeof MyStore>();

    di.set(AMy).set(Test).init();

    const obj = new Obj({
      t: inject(Test, TestNew),
    });

    expect(obj.t.someMethod()).toBe(999);
    expect(obj.default).toBe(12); // 10 + 1 default + DI Test
  });
});
