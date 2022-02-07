import { AnyDict } from './types';
import { history, State } from './utils/history';

export function push(to: string, meta?: AnyDict): void {
  history.push(to, { meta } as State);
}

export function replace(to: string, meta?: AnyDict): void {
  history.replace(to, { meta } as State);
}

export function back(): void {
  history.back();
}

export function forward(): void {
  history.forward();
}

export function go(delta: number): void {
  history.go(delta);
}
