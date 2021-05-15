import { di, diSet } from '../src';

// useStore('sdfsdf');

// new class

// getStore('sdfsdf');

// Test
// setStore('sdfsdf', NewClass);

class A {
  status = 5;
}

class C {
  count = 3;
  constructor(a = di(A)) {
    this.count += a.status;
  }
}

class F {
  cells = 0;

  constructor({ a = di(A) } = {}) {
    this.cells = a.status;
  }
}

class B {
  constructor(private a = di(A), private c = di(C), private f = di(F)) {}

  get ready() {
    return this.a.status + this.c.count + this.f.cells;
  }
}

class BB extends B {
  get ready() {
    return 12;
  }
}

diSet(B, BB);

const bStore = new B();

console.log(bStore.ready);

console.log(di(B).ready);

di(A).status += 1;

console.log(di(B).ready);

// console.log((bStore.ready = 2));

// console.log(bStore2.ready);

// - system|global - DI
// - local new Class() -> global
