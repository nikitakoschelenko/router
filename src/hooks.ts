import { useEffect, useMemo, useState } from 'react';
import { Action } from 'history';
import { AnyDict, StringDict } from './types';
import { history, State } from './utils/history';

export function useParams<T extends StringDict>(): T {
  let rerender = useState<unknown>()[1];

  let params = useMemo(
    () =>
      Object.fromEntries(
        new URLSearchParams(
          history.location.search.slice(1)
        ) as unknown as Iterable<any>
      ) ?? {},
    [history.location.search]
  );

  useEffect(() => {
    return history.listen(({ action }) => {
      if (action === Action.Pop) rerender({});
    });
  }, []);

  return params as T;
}

// TODO: problems with swipeback and animations
export function useMeta<T extends AnyDict>(): T {
  let rerender = useState<unknown>()[1];

  let meta: AnyDict = useMemo(
    () => (history.location.state as State)?.meta ?? {},
    [history.location.state]
  );

  useEffect(() => {
    return history.listen(({ action }) => {
      if (action === Action.Pop) rerender({});
    });
  }, []);

  return meta as T;
}
