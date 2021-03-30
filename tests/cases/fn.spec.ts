import { DI, injectFn } from '../../src';
import { A } from '../stores/a';

describe('Fn', () => {
  test('Simple', () => {
    class V {
      a = injectFn(A);
    }

    const di = new DI();

    di.set(V).set(A).init();

    const v = di.get(V);

    expect(v.a().count).toEqual(1);
    expect(v.a().add()).toEqual(2);
    expect(v.a().count).toEqual(2);
  });
});
