# di

Dependency injection

- No decorators, emitDecoratorMetadata, "reflect-metadata"
- Dynamic init
- Runtime hot reload
- Containers
- Small size
- Strict type checks
- Legacy mode without Proxy

## Install

```bash
npm i @askuzminov/di
```

For test builds add in `~/.npmrc`

```bash
@askuzminov:registry=https://npm.pkg.github.com/
```

## Inject dependency

```typescript
import { inject } from '@askuzminov/di';
```

### Simple way

```typescript
class A {
  count = 1;
}

class B {
  a = inject(A);

  getA() {
    return this.a.count;
  }
}
```

### Classic way (arguments)

```typescript
class A {
  count = 1;
}

class B {
  constructor(pivate a = inject(A)) {}

  getA() {
    return this.a.count;
  }
}
```

### Object way (independent order)

```typescript
class A {
  count = 1;
}

class B {
  a: A;

  constructor({ a = inject(A) } = {}) {
    this.a = a;
  }

  getA() {
    return this.a.count;
  }
}
```

### Inside way (only for 1 container in App)

```typescript
class A {
  count = 1;
}

class B {
  getA() {
    return inject(A).count;
  }
}
```

## DI Container

You can usage many containers in App

```typescript
import { DI, MyStore } from '@askuzminov/di';

// Simple (any class)
export const di = new DI();

// With interface (all stores should extends from base class)
class MyStore {
  initStore() {}
  clearStore() {}
}

export const diTyped = new DI<typeof MyStore>();

// Predefined static container
export const diStatic = new DI({
  someName: SomeStore,
  ...
});
```

## Usage DI

```typescript
class A {
  count = 1;
}

class B {
  a = inject(A);

  getA() {
    return this.a.count;
  }
}

const di = new DI();

di.set(A).set(B).init();

const bStore = di.get(B); // instance B

bStore.getA(); // B.getA() -> A.count -> 1

// Static mode
const di = new DI({
  a: A,
  b: B,
}).init();

const bStore = di.get('b'); // instance B

bStore.getA(); // B.getA() -> A.count -> 1
```

## Add store after init

```typescript
di.set(Class);
di.set('nameStore', Class); // in static mode

di.init(); // confirm to add;
```

## Replace store

```typescript
di.set(BaseClass, NewClass).init(); // NewClass replace BaseClass
di.set('nameStore', NewClass).init(); // NewClass replace nameStore in static mode
```

## Rebuild store

```typescript
di.rebuild(BaseClass); // reinit BaseClass
di.rebuild('nameStore'); // reinit nameStore in static mode
di.rebuild(); // reinit all
```

## Override inject in tests

```typescript
class SomeTest {
  a = inject(A, ATestClass); // replace A by ATestClass
}
```

## Legacy browser (not Proxy)

```typescript
import { injectFn } from '@askuzminov/di';

class A {
  count = 1;
}

class B {
  a = injectFn(A);

  getA() {
    return this.a().count; // get Function, not Proxy
  }
}
```

Note: not save result this.a() in variable, if using runtime reloading.

## Cycles errors

If you not use constructor, you will not have this errors.

But if A depends from B, and B depends from A, you have these options:

- Separate common part to C (work with any DI systems)
- Separate steps

  - Not access other stores in constructor
  - Use initStore for init

  ```typescript
  class B extends MyStore {
    constructor(public a = inject(A)) {}

    initStore() {
      this.a.count;
    }
  }

  // constructor step
  di.set(A).set(B).init();

  // init step
  di.run(store => store.initStore());
  ```

- Delay usage

  ```typescript
  class B {
    constructor(a = inject(A)) {
      setTimeout(() => {
        this.a.count;
      });
    }
  }
  ```

## Transient

```typescript
class Test {
  uniq = transient(A); // Local one time inject
}

const aLocal = di.transient(A); // same as new A(), but in current di container
```

## Run in all

```typescript
class Best extends MyStore {
  clearStore() {
    // ...
  }
  async initStore() {
    await delay();
    // ...
  }
}

const di = new DI<typeof MyStore>();
di.set(Best).init();

// Sync run
di.run(store => store.clearStore());

// Async run
await di.runAsync(store => store.initStore());
```

## More examples

See in `tests` folder

## TODO

- DeepReadonly support
- DevTools
