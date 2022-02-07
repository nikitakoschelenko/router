import React, {
  Children,
  cloneElement,
  FC,
  isValidElement,
  ReactNode,
  useMemo,
  useState
} from 'react';
import { deepForEach, deepMap } from 'react-children-utilities';
import { Action, Update } from 'history';
import { ViewProps } from '@vkontakte/vkui';
import { getNavId } from '@vkontakte/vkui/dist/lib/getNavId';

import { NODE_ID_ATTRIBUTE } from './constants';
import { AnyDict } from './types';
import { deserialize } from './utils/deserialize';
import { createNodeID } from './utils/random';
import { getNodeType } from './utils/node';
import { createNav, Nav, NavNodeID, NavTransitionID } from './utils/navs';
import { detectStyle } from './utils/style';
import { history } from './utils/history';

function markNodeIDs(root: ReactNode): ReactNode {
  return deepMap(root, (node: ReactNode) => {
    if (!isValidElement(node)) return node;

    let navID: string | undefined = getNavId(node.props);

    // mark only VKUI elements
    if (!navID) return node;

    return cloneElement(node, {
      ...node.props,
      [NODE_ID_ATTRIBUTE]: createNodeID()
    });
  })[0];
}

function extractLayoutsAsNavs(root: ReactNode): Nav[] {
  let items: Nav[] = [];

  deepForEach(root, (node: ReactNode) => {
    if (!isValidElement(node)) return;

    let { type } = getNodeType(node);
    if (!type) return;

    let navID: string | undefined = getNavId(node.props);
    if (!navID) return;

    let availableTransitionIDs: NavTransitionID[] = Children.toArray(
      node.props.children
    )
      .map((child) => isValidElement(child) && getNavId(child.props))
      .filter((child) => child) as NavTransitionID[];
    let nodeID: NavNodeID = node.props[NODE_ID_ATTRIBUTE];

    items.unshift(createNav(type, navID, availableTransitionIDs, nodeID));
  });

  return items;
}

function renderRoute(
  root: ReactNode,
  navs: Nav[],
  config: Omit<MatchConfig, 'plugins'>
): ReactNode {
  let { pathname } = history.location;

  let deserialized: AnyDict = deserialize(root, pathname);
  if (Object.keys(deserialized).length === 0) {
    // not found
    console.warn('Route not found.');

    if (config.fallbackURL) history.replace(config.fallbackURL);

    return;
  }

  return deepMap(root, (node: ReactNode) => {
    if (!isValidElement(node)) return node;

    let nodeID: string | undefined = node.props[NODE_ID_ATTRIBUTE];
    if (!nodeID) return node;

    let { type, key } = getNodeType(node);
    if (!type || !key) return node;

    let props: AnyDict = {
      ...node.props,
      // active prop
      [key]: deserialized[nodeID] ?? '/'
    };

    if (type === 'view' && config.style === Style.MOBILE) {
      let nav: Nav = navs.find((nav) => nav.nodeID === nodeID)!;

      (props as ViewProps).history = nav.transitions;
      (props as ViewProps).onSwipeBack = history.back;
    }

    return cloneElement(node, props);
  })[0];
}

export enum Style {
  MOBILE = 'MOBILE',
  DESKTOP = 'DESKTOP'
}

export type MatchConfig = {
  style?: Style;
  fallbackURL?: string;
};

export const Match: FC<MatchConfig> = ({ children, ...config }) => {
  let rerender = useState<unknown>()[1];

  let root: ReactNode = useMemo(() => markNodeIDs(children), []);
  let navs: Nav[] = useMemo(() => extractLayoutsAsNavs(root), []);

  // set or detect style
  config.style = config.style ?? useMemo(() => detectStyle(), []);

  // listen events and rerender
  useMemo(() => {
    history.replace('/');

    // history.listen returns unlisten function
    return history.listen(({ location: { pathname }, action }: Update) => {
      let deserialized: AnyDict = deserialize(root, pathname);
      let keys: string[] = Object.keys(deserialized);

      // not found
      if (keys.length === 0) return;

      navs.forEach(({ nodeID, transitions }) => {
        let activeNavID: string = deserialized[nodeID] ?? '/';
        if (transitions.at(-1) === activeNavID) return;

        if (action === Action.Push) transitions.push(activeNavID);
        if (action === Action.Replace) transitions.splice(-1, 1, activeNavID);

        if (action === Action.Pop) {
          // TODO: back and forward for delta < -1 and delta > 1
          let back: boolean = transitions.includes(activeNavID);

          if (back) {
            // back
            transitions.pop();
          } else {
            // forward
            transitions.push(activeNavID);
          }
        }
      });

      rerender({});
    });
  }, []);

  // render current route
  return <>{renderRoute(root, navs, config)}</>;
};
