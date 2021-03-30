import { DI } from '../../src';
import { A } from '../stores/a';
import { B } from '../stores/b';

describe('Rebuild', () => {
  test('Class', () => {
    const di = new DI();
    di.set(A).set(B).init();
    const b = di.get(B);
    expect(b.action()).toEqual(1);
    expect(b.someAdd()).toEqual(2);
    expect((b.pos = 1)).toEqual(1);

    di.rebuild(A);

    expect(b.action()).toEqual(1);
    expect(b.pos).toEqual(1);

    di.rebuild();

    expect(b.action()).toEqual(1);
    expect(b.pos).toEqual(0);
  });

  test('Class', () => {
    const di = new DI({
      a: A,
      b: B,
    }).init();

    const b = di.get('b');
    expect(b.action()).toEqual(1);
    expect(b.someAdd()).toEqual(2);
    expect((b.pos = 1)).toEqual(1);

    di.rebuild('a');

    expect(b.action()).toEqual(1);
    expect(b.pos).toEqual(1);

    di.rebuild();

    expect(b.action()).toEqual(1);
    expect(b.pos).toEqual(0);
  });
});
