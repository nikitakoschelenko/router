import React, {
  Children,
  cloneElement,
  createContext,
  FC,
  isValidElement,
  ReactElement,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { deepForEach, deepMap } from 'react-children-utilities';
import { Action, Listener, Update, createPath } from 'history';
import {
  ViewProps,
  View as VKUIView,
  Root as VKUIRoot,
  Epic as VKUIEpic
} from '@vkontakte/vkui';

import { View, Root, Epic } from './components';
import { useStyle } from './hooks';
import { AnyDict, StringDict } from './types';
import { deserialize } from './utils/deserialize';
import { getNavID, getNodeID, NODE_ID_ATTRIBUTE } from './utils/node';
import { createNav, Nav, NavType } from './utils/navs';
import { history, State, FallbackMeta } from './utils/history';
import { setLocation } from './utils/bridge';

function createNodeID(node: ReactNode): string {
  let key: string = '';

  deepForEach(node, (node) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (isValidElement(node)) key += node.key ?? node.type.name;
  });

  return key;
}

function markNodeIDs(root: ReactNode): ReactNode {
  return deepMap(root, (node: ReactNode) => {
    if (!isValidElement(node)) return node;

    let navID: string | undefined = getNavID(node);

    // mark only VKUI elements
    if (!navID) {
      switch (node.type) {
        case View:
        case Root:
        case Epic:
          console.warn(
            '[router] found known navigation layout but no `nav` property. Maybe you forgot about it?'
          );
          break;

        case VKUIView:
        case VKUIRoot:
        case VKUIEpic:
          console.warn(
            '[router] use View, Root and Epic imported from the router to work correctly.'
          );
          break;
      }

      return node;
    }

    return cloneElement(node, {
      ...node.props,
      [NODE_ID_ATTRIBUTE]: createNodeID(node)
    });
  })[0];
}

function extractLayoutsAsNavs(root: ReactNode): Nav[] {
  let items: Nav[] = [];

  deepForEach(root, (node: ReactNode) => {
    if (!isValidElement(node)) return;

    let navID: string | undefined = getNavID(node);
    if (!navID) return node;

    let type: NavType;
    switch (node.type) {
      case View:
        type = 'view';
        break;

      case Root:
        type = 'root';
        break;

      case Epic:
        type = 'epic';
        break;

      default:
        return node;
    }

    let availableTransitionIDs: string[] = Children.toArray(node.props.children)
      .map((child) => isValidElement(child) && getNavID(child))
      .filter((navID) => !!navID) as string[];
    let nodeID: string = node.props[NODE_ID_ATTRIBUTE];

    items.unshift(createNav(type, navID, availableTransitionIDs, nodeID));
  });

  return items;
}

function renderRoute(
  pathname: string,
  root: ReactNode,
  navs: Nav[],
  style: Style
): ReactNode {
  let deserialized: StringDict = deserialize(root, navs, pathname);

  return deepMap(root, (node: ReactNode) => {
    if (!isValidElement(node)) return node;

    let nodeID: string | undefined = getNodeID(node);
    if (!nodeID) return node;

    let active: string = deserialized[nodeID] ?? '/';
    let props: AnyDict = {
      ...node.props
    };

    switch (node.type) {
      case View:
        props.activePanel = active;

        // swipeback on mobile
        if (style === Style.MOBILE) {
          let nav: Nav = navs.find((nav) => nav.nodeID === nodeID)!;

          (props as ViewProps).history = nav.transitions;
          (props as ViewProps).onSwipeBack = history.back;
        }

        break;

      case Root:
        props.activeView = active;
        break;

      case Epic:
        props.activeStory = active;
        break;

      default:
        return node;
    }

    return cloneElement(node, props);
  })[0];
}

export type MatchContextValue = MatchConfig & {
  /**
   * Промаркированные дети
   */
  root: ReactNode;

  /**
   * Слои навигации
   */
  navs: Nav[];

  /**
   * Стиль навигации
   */
  style: Style;
};

/**
 * Контекст с конфигом компонента Match и внутренними значениями роутера
 */
export const MatchContext = createContext<MatchContextValue>(
  {} as MatchContextValue
);

/**
 * Стиль навигации
 */
export enum Style {
  MOBILE = 'MOBILE',
  DESKTOP = 'DESKTOP'
}

/**
 * Конфиг для компонента Match
 */
export type MatchConfig = {
  /**
   * Стиль навигации.
   * По умолчанию берётся платформа, прокинутая через ConfigProvider
   */
  style?: Style;

  /**
   * Начальная страница.
   * Если не указана, то при запуске не будет совершён переход
   */
  initialURL?: string;

  /**
   * Страница 404.
   * Будет использована, если страница при переходе не найдена
   */
  fallbackURL?: string;

  /**
   * Отключает отправку события VKWebAppSetLocation для установки хэша вне фрейма.
   * По умолчанию выключено, событие отправляется
   */
  disableSetLocation?: boolean;
};

/**
 * Главный компонент роутера, в него оборачивается вся структура
 */
export const Match: FC<MatchConfig> = ({
  children,
  style: _style,
  initialURL,
  fallbackURL,
  disableSetLocation
}) => {
  let rerender = useState<unknown>()[1];
  let frender = useRef(true);

  let root: ReactNode = useMemo(() => markNodeIDs(children), [children]);
  let navs: Nav[] = useMemo(() => extractLayoutsAsNavs(root), []);

  let route: string = frender.current
    ? initialURL ?? history.location.pathname
    : history.location.pathname;

  // set or detect style
  let style: Style = _style ?? useStyle();

  // listen events and rerender
  useEffect(() => {
    let listener: Listener = ({ location, action }: Update) => {
      let state: State<any> | undefined = location.state as
        | State<any>
        | undefined;
      let deserialized: StringDict = deserialize(root, navs, location.pathname);
      let keys: string[] = Object.keys(deserialized);

      // not found
      if (keys.length === 0) {
        console.warn('[router] route not found.');

        if (fallbackURL) {
          if (state?.meta?.retry > 0)
            return console.error('[router] fallback route not found.');

          return history.replace(fallbackURL, {
            force: true,
            meta: {
              from: createPath(location),
              retry: state?.meta?.retry ? state?.meta?.retry + 1 : 1,
              meta: state?.meta
            }
          } as State<FallbackMeta<any>>);
        }
      }

      if (state?.force) action = Action.Push;

      navs.forEach(({ nodeID, transitions }) => {
        let activeNavID: string = deserialized[nodeID] ?? '/';
        if (transitions[transitions.length - 1] === activeNavID) return;

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

      // set parent page location hash with vk bridge
      if (!disableSetLocation) setLocation(location);

      rerender({});
    };

    let unlisten: VoidFunction = history.listen(listener);

    let nextURL: string = createPath(history.location);
    if (initialURL) {
      if (initialURL !== nextURL) {
        route = initialURL;
        history.replace(initialURL);
      }
    } else if (history.location.search.slice(1)) {
      history.push(history.location.pathname);
      history.push(nextURL);
    } else if (history.location.pathname.slice(1)) {
      history.replace('/');
      history.push(nextURL);
    }

    // set is first render to false
    frender.current = false;

    // history.listen returns unlisten function
    return unlisten;
  }, []);

  // provider for match context
  return (
    <MatchContext.Provider
      value={
        {
          root,
          navs,
          style,
          initialURL,
          fallbackURL,
          disableSetLocation
        } as MatchContextValue
      }
    >
      {/* render current route */}
      {renderRoute(route, root, navs, style)}
    </MatchContext.Provider>
  );
};

/**
 * Получение активного попаута по nav/id свойству
 * @param popout имя активного попаута
 * @param elements возможные попауты
 * @returns активный попаут
 */
export function matchPopout(
  popout: string | null,
  elements: ReactElement[]
): ReactElement | null {
  return popout
    ? elements.find((node) => getNavID(node) === popout) ?? null
    : null;
}
