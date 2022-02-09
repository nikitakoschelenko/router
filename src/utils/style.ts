import bridge from '@vkontakte/vk-bridge';

import { Style } from '../match';

export function detectStyle(): Style {
  if (bridge.isEmbedded()) {
    let params: URLSearchParams = new URLSearchParams(location.search);
    let platform: string = params.get('vk_platform') ?? 'desktop_web';

    return (
      {
        iphone: Style.MOBILE,
        android: Style.MOBILE,
        mobile_web: Style.MOBILE,
        desktop_web: Style.DESKTOP
      }[platform] ?? Style.MOBILE
    );
  }

  return document.body.clientWidth >= 768 ? Style.DESKTOP : Style.MOBILE;
}
