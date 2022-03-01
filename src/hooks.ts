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
import { Platform, SizeType, useAdaptivity, VKCOM } from '@vkontakte/vkui';

import bridge from '@vkontakte/vk-bridge';

import { AnyDict, StringDict } from './types';
import { MatchContext, Style } from './match';
import { history, State } from './utils/history';
import { deserialize } from './utils/deserialize';
import { NavNodeID, NavTransitionID } from './utils/navs';

function getParams<T>(): T {
  return (Object.fromEntries(
    new URLSearchParams(
      history.location.search.slice(1)
    ) as unknown as Iterable<any>
  ) ?? {}) as T;
}

/**
 * Хук для получения параметров
 */
export function useParams<T extends StringDict>(): T {
  let [params, setParams] = useState<StringDict>(getParams);

  useEffect(() => {
    return history.listen(() => setParams(getParams));
  }, []);

  return params as T;
}

function getMeta<T>(): T {
  return ((history.location.state as State<T>)?.meta ?? {}) as T;
}

/**
 * Хук для получения метаданных
 */
export function useMeta<T extends AnyDict>(): T {
  let [meta, setMeta] = useState<AnyDict>(getMeta);

  useEffect(() => {
    return history.listen(() => setMeta(getMeta));
  }, []);

  return meta as T;
}

function getLocation(): Location {
  return history.location;
}

/**
 * Хук для получения текущей локации
 */
export function useLocation(): Location {
  let [location, setLocation] = useState<Location>(getLocation);

  useEffect(() => {
    return history.listen(() => setLocation(getLocation));
  }, []);

  return location;
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
  let { sizeX, viewWidth } = useAdaptivity();

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

    // without AdaptivityProvider always viewWidth is 0 and sizeX is COMPACT so fix that
    return (
      viewWidth ? sizeX === SizeType.REGULAR : document.body.clientWidth > 650
    )
      ? Platform.VKCOM
      : Platform.IOS;
  }, [location.search, viewWidth ? sizeX : document.body.clientWidth]);

  return platform;
}

/**
 * Хук для получения текущего стиля навигации
 */
export function useStyle(): Style {
  let platform: Platform = useVKPlatform();

  return platform === VKCOM ? Style.DESKTOP : Style.MOBILE;
}
