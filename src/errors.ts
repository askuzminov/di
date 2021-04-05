import { Constructor } from './types';

export class ErrorRun extends Error {
  constructor(public item: string, public error?: unknown) {
    super(`Module "${item}" fail with error`);
  }
}

export class ErrorCyclic {
  constructor(public item: string, public element: Constructor) {}
}

export class ErrorNotDefined extends Error {
  constructor() {
    super('Class not defined');
  }
}

export class ErrorDiNotInited extends Error {
  constructor() {
    super('DI not inited');
  }
}
