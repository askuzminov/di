import { di, di2 } from '../container';
import { A } from '../stores/a';
import { B } from '../stores/b';

describe('Containers', () => {
  test('Base', () => {
    di.set(A).set(B).init();
    di2.set(A).set(B).init();

    const a = di.get(A);
    const a2 = di2.get(A);

    a.add();

    expect(a.count).toBe(2);
    expect(a2.count).toBe(1);

    a2.add();

    expect(a.count).toBe(2);
    expect(a2.count).toBe(2);

    di.rebuild(A);

    expect(a.count).toBe(1);
    expect(a2.count).toBe(2);

    di2.rebuild(A);

    expect(a.count).toBe(1);
    expect(a2.count).toBe(1);
  });
});
