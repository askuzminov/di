import { inject } from '../../src';
import { A } from './a';

export class B {
  a = inject(A);

  pos = 0;

  action() {
    return this.a.count;
  }

  someAdd() {
    this.a.add();

    return this.a.getter;
  }
}
