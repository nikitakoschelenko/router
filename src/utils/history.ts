import { createHashHistory, HashHistory } from 'history';

import { AnyDict } from '../types';

export type State<T extends AnyDict> = {
  force?: boolean;
  meta?: T;
};

export type FallbackMeta<T extends AnyDict> = {
  from: string;
  retry: number;
  meta: T;
};

export let history: HashHistory = createHashHistory({ window });
