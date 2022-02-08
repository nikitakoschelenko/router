import { useContext, useEffect, useMemo, useState } from 'react';
import { Location } from 'history';
import { AnyDict, StringDict } from './types';
import { MatchContext } from './match';
import { history, State } from './utils/history';
import { deserialize } from './utils/deserialize';
import { NavNodeID, NavTransitionID } from './utils/navs';

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
    return history.listen(rerender);
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
    return history.listen(rerender);
  }, []);

  return meta as T;
}

export function useLocation(): Location {
  return history.location;
}

export function useDeserialized(): Record<'view' | 'panel' | string, string> {
  let { root, navs } = useContext(MatchContext);

  let deserialized: StringDict = useMemo(
    () => deserialize(root, history.location.pathname),
    [history.location.pathname]
  );

  let rootNodeID: NavNodeID =
    navs.find(({ type }) => type === 'root' || type === 'epic')?.nodeID ?? '/';
  let view: NavTransitionID = deserialized[rootNodeID] ?? '/';

  let viewNodeID: NavNodeID =
    navs.find(({ type, navID }) => type === 'view' && navID === view)?.nodeID ??
    '/';
  let panel: NavTransitionID = deserialized[viewNodeID] ?? '/';

  return {
    ...deserialized,
    view,
    panel
  };
}
