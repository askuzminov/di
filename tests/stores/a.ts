export class A {
  count = 1;

  add() {
    return ++this.count;
  }

  get getter() {
    return this.count;
  }
}
