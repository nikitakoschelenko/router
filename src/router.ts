import { Blocker } from 'history';
import { AnyDict } from './types';
import { history, State } from './utils/history';

/**
 * Transition to next page
 * @param to next page
 * @param meta next meta
 */
export function push(to: string, meta?: AnyDict): void {
  return history.push(to, { meta } as State);
}

/**
 * Transition to next page and remove past from history
 * @param to next page
 * @param meta next meta
 */
export function replace(to: string, meta?: AnyDict): void {
  return history.replace(to, { meta } as State);
}

/**
 * Transition back
 */
export function back(): void {
  return history.back();
}

/**
 * Transition forward
 */
export function forward(): void {
  return history.forward();
}

/**
 * Transition delta steps forward/backward
 * @param delta number of steps
 */
export function go(delta: number): void {
  return history.go(delta);
}

/**
 * Prevents the current location from changing and sets up a listener that will be called instead
 * @param blocker a function that will be called when a transition is blocked
 * @returns a function that may be used to stop blocking
 */
export function block(blocker: Blocker): VoidFunction {
  return history.block(blocker);
}
