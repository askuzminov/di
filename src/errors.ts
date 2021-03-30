import { Constructor } from './types';

export class ErrorRun extends Error {
  constructor(public item: string, public error?: unknown) {
    super(`Module "${item}" fail with error`);
  }
}

export class ErrorCyclic {
  constructor(public item: string, public element: Constructor) {}
}
