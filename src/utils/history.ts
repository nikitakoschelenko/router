import { createHashHistory, HashHistory } from 'history';

import { AnyDict } from '../types';

export let history: HashHistory = createHashHistory({
  window
});

export type State<T extends AnyDict> = {
  forcePush?: boolean;
  meta?: T;
};
