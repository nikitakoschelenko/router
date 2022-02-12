import { Blocker } from 'history';
import { AnyDict } from './types';
import { history, State } from './utils/history';

/**
 * Переход к следующей странице
 * @param to URL новой страницы
 * @param meta метаданные
 */
export function push(to: string, meta?: AnyDict): void {
  return history.push(to, { meta } as State);
}

/**
 * Переход к следующей странице и удаление старой из истории
 * @param to URL новой страницы
 * @param meta метаданные
 */
export function replace(to: string, meta?: AnyDict): void {
  return history.replace(to, { meta } as State);
}

/**
 * Переход назад
 */
export function back(): void {
  return history.back();
}

/**
 * Переход впёред
 */
export function forward(): void {
  return history.forward();
}

/**
 * Переход на ±delta шагов вперёд/назад, в зависимости от знака
 * @param delta число шагов
 */
export function go(delta: number): void {
  return history.go(delta);
}

/**
 * Предотвращает изменение текущей локации и устанавливает слушатель, который будет вызываться вместо глобального
 * @param blocker функция, которая будет вызвана во время попытки покинуть локацию
 * @returns функция для раблокировки
 */
export function block(blocker: Blocker): VoidFunction {
  return history.block(blocker);
}
