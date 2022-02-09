import { Blocker } from 'history';
import { AnyDict } from './types';
import { history, State } from './utils/history';

export function push(to: string, meta?: AnyDict): void {
  return history.push(to, { meta } as State);
}

export function replace(to: string, meta?: AnyDict): void {
  return history.replace(to, { meta } as State);
}

export function back(): void {
  return history.back();
}

export function forward(): void {
  return history.forward();
}

export function go(delta: number): void {
  return history.go(delta);
}

export function block(blocker: Blocker): VoidFunction {
  return history.block(blocker);
}
