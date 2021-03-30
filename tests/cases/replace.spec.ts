import { DI } from '../../src';
import { A } from '../stores/a';

class TEST implements A {
  count = 100;
  getter = this.count;
  add() {
    return 0;
  }
}

describe('Replace', () => {
  test('Class', () => {
    const di = new DI();
    di.set(A).init();
    const a = di.get(A);
    expect(a.count).toEqual(1);

    di.set(A, TEST).init();

    expect(a.count).toEqual(100);
  });
});
