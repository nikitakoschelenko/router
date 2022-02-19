import {
  MouseEvent,
  MouseEventHandler,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import { Location } from 'history';
import { Platform, VKCOM } from '@vkontakte/vkui';

import bridge from '@vkontakte/vk-bridge';

import { AnyDict, StringDict } from './types';
import { MatchContext, Style } from './match';
import { history, State } from './utils/history';
import { deserialize } from './utils/deserialize';
import { NavNodeID, NavTransitionID } from './utils/navs';

/**
 * Хук для получения параметров
 */
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

/**
 * Хук для получения метаданных
 */
// TODO: problems with swipeback and animations
export function useMeta<T extends AnyDict>(): T {
  let rerender = useState<unknown>()[1];

  let meta: AnyDict = useMemo(
    () => (history.location.state as State<T>)?.meta ?? {},
    [history.location.state]
  );

  useEffect(() => {
    return history.listen(rerender);
  }, []);

  return meta as T;
}

/**
 * Хук для получения текущей локации
 */
export function useLocation(): Location {
  return history.location;
}

/**
 * Хук для получения активных свойств слоёв навигации
 */
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

let actionRef: Element | null = null;

/**
 * Хук для удобной работы с рефами при использовании ActionSheet
 * @param handler обработчик при установке рефа, в нём нужно делать переход к ActionSheet. Не используется в самом ActionSheet при получении рефа
 */
export function useActionRef(handler?: (e: Element | null) => void) {
  let setActionRef = useCallback(
    (el: Element | null) => {
      actionRef = el;
      if (handler) handler(actionRef);
    },
    [handler]
  );

  let setActionRefHandler: MouseEventHandler<HTMLElement> = useCallback(
    (e: MouseEvent<HTMLElement> | undefined) => {
      actionRef = e?.target as Element;
      if (handler) handler(actionRef);
    },
    [handler]
  );

  return { actionRef, setActionRef, setActionRefHandler };
}

/**
 * Хук для определения платформы
 */
export function useVKPlatform(): Platform {
  let platform: Platform = useMemo(() => {
    if (bridge.isEmbedded()) {
      let params: URLSearchParams = new URLSearchParams(location.search);
      let vkPlatform: string | null = params.get('vk_platform');

      if (vkPlatform) {
        let resultPlatform: Platform | undefined = {
          desktop_web: Platform.VKCOM,
          mobile_android: Platform.ANDROID,
          mobile_android_messenger: Platform.ANDROID,
          mobile_ipad: Platform.IOS,
          mobile_iphone: Platform.IOS,
          mobile_iphone_messenger: Platform.IOS,
          mobile_web: Platform.IOS,
          android_external: Platform.ANDROID,
          iphone_external: Platform.IOS,
          ipad_external: Platform.IOS,
          web_external: Platform.VKCOM,
          mvk_external: Platform.IOS
        }[vkPlatform];

        if (resultPlatform) return resultPlatform;
      }
    }

    return document.body.clientWidth >= 768 ? Platform.VKCOM : Platform.IOS;
  }, [location.search, document.body.clientWidth]);

  return platform;
}

/**
 * Хук для получения текущего стиля навигации
 */
export function useStyle(): Style {
  let platform: Platform = useVKPlatform();

  return platform === VKCOM ? Style.DESKTOP : Style.MOBILE;
}
